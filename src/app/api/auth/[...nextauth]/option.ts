import { NextAuthOptions } from "next-auth";  // for Type safety , we are telling TypeScript that this object must follow next/auth rules
import CredentialsProvider from "next-auth/providers/credentials";  //  this enables email/password login instead of google/github...this is for custom login
import bcrypt from "bcryptjs";
import dbConnect from "../../../../lib/dbConnect";
import { UserModel } from "@/src/models/User";
import GoogleProvider from 'next-auth/providers/google'

// This file configures NextAuth.

export const authOptions : NextAuthOptions = {
    providers:[  // How user log in ..... CredentialProviders ---- I want a custom credentials based login 
        CredentialsProvider({       // here we are designing a signIn page ...like when we use github provider then automatically github button aa jaata h
            id:"credentials",        // like this only how many credentials we want directly come on page , so behind the seen next-auth will create a html form which accept values as required
            name:"credentials",
            credentials:{  // auto-generated form   ....... NextAuth auto generates an HTML form
                email :{label : "email", type: "text", placeholder:"Enter your email"},
                password:{label:"Password", type:"password", placeholder:"Enter your password"}
            },

            async authorize(credentials:any):Promise<any>{ // This function does only one thing ... Are these credentials valid ...If yes return user if NO throw error
                try {
                     await dbConnect();
                    const user = await UserModel.findOne({
                        email: credentials.email
                    })

                    if(!user){
                        throw new Error("Invalid email or password");
                    }
                    
                    if(user.authProvider !== "credentials"){
                        throw new Error(`Account registered with ${user.authProvider}`)
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,user.password)

                    if(isPasswordCorrect){
                        return {
                            _id: user._id.toString(),
                            email: user.email,
                            // isVerified: user.isVerified,
                            role: user.role,
                            name: user.name,
                        };
                    }else{
                        throw new Error("Invalid email or password")
                    }
                } catch (error:any) {
                    throw new Error(error.message || "Error during authentication");
                }
            }

        }),
        GoogleProvider({
            clientId:process.env.GOOGLE_CLIENT_ID!,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks:{  // What data is stored 
        async signIn({user,account}){
            if(account?.provider === "google"){
                await dbConnect();
                const dbUser = await UserModel.findOne({email:user.email});

                if(dbUser && dbUser.authProvider !== "google"){
                    return `/signIn?error=This+email+is+already+registered+with+${dbUser.authProvider}.+Please+sign+in+via+that+method.`
                } // singIn me jaa rha as a toast error ke foramte me 
            }
            return true;
        },
        async jwt({ token, user , trigger, session }) { 

              // handle update() call from frontend
            if (trigger === "update") {
                await dbConnect();
                const dbUser = await UserModel.findById(token._id);
                if (dbUser) {
                    token.role = dbUser.role
                }
                return token;
            }   

            // only runs on initial sign in
            if(user){
                // For credentials login, user object already has all fields including role
                if(user.role){
                    token._id = user._id
                    token.role = user.role
                    token.isNewUser = !user.name
                    return token
                }
                
                // For Google OAuth login, query database
                await dbConnect();
                let dbUser = await UserModel.findOne({email:user.email})

                if(!dbUser){
                    // new Google user — create account
                    if (!user.email) {
                        throw new Error("Email is required for Google login");
                    }
                    const baseUsername = user.email.split("@")[0];
                    let username = baseUsername;
                    let counter = 1;

                    while (await UserModel.findOne({ username })) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }
                    dbUser = await UserModel.create({
                        email: user.email,
                        username: username,
                        name: user.name || user.email.split("@")[0],
                        password: "", // No password for OAuth users
                        // isVerified: true, // Google users are pre-verified
                        role: "employee",
                        // department: "",
                        authProvider: "google",
                    })
                }
            
                token._id = dbUser._id?.toString()
                token.role = dbUser.role
                token.isNewUser = !dbUser.name
            }
            return token;
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                // session.user.isVerified = token.isVerified
                // session.user.isAcceptingMessage = token.isAcceptingMessage
                // session.user.username = token.username
                // session.user.isNewUser = token.isNewUser
                session.user.role = token.role
                // session.user.specialization = token.specialization
            }
            return session
        },
    },
    pages:{   //this tells next-auth : Don't use your default login page ... Use my /sign-in page instead... without this NextAuth auto generates a page 
        signIn:'/signIn'   // its like next auth will also automatically design the sign in page but if we want to create our own sign in page then we can specify here
    },   //because we have written pages:{signIn:'/sign-in'} so we have to manually create form in signIn/page.tsx
    session:{
        strategy:"jwt"  
    },
    jwt:{
        secret:process.env.NEXTAUTH_SECRET // we have added this here because the getToken in middleware sometimes can't get nextAuth secret key 
    },
    secret:process.env.NEXTAUTH_SECRET
}