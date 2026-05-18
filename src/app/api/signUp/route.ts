import { signUpSchema } from "@/src/schemas/signUpSchema";
import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        await dbConnect();
        
        const body = await request.json();
        
        // Validate input against schema
        const validationResult = signUpSchema.safeParse(body);
        
        if (!validationResult.success) {
            return Response.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.issues.map(issue => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                },
                { status: 400 }
            );
        }

        const { email, password, role } = validationResult.data;
        const authProvider = body.authProvider || "credentials";

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return Response.json(
                {
                    success: false,
                    message: "Email already registered"
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with selected role
        const newUser = await UserModel.create({
            email,
            password: hashedPassword,
            authProvider: authProvider,
            role: role, // User-selected role
            department: "",
            isVerified: true, // Auto-verified, no email verification required
            name: email.split("@")[0] // Use email prefix as name
        });

        return Response.json(
            {
                success: true,
                message: "User registered successfully",
                data: {
                    _id: newUser._id,
                    email: newUser.email,
                    role: newUser.role
                }
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("SIGNUP_ERROR:", error);
        return Response.json(
            {
                success: false,
                message: error.message || "An error occurred during signup"
            },
            { status: 500 }
        );
    }
}
