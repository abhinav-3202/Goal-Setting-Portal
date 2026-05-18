import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export async function POST(request: Request) {
    try {
        await dbConnect();
        
        const body = await request.json();
        
        // Validate input
        const validationResult = signInSchema.safeParse(body);
        
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

        const { email, password } = validationResult.data;

        // Find user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email or password"
                },
                { status: 401 }
            );
        }

        // Check auth provider
        if (user.authProvider !== "credentials") {
            return Response.json(
                {
                    success: false,
                    message: `Account registered with ${user.authProvider}. Please sign in via that method.`
                },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email or password"
                },
                { status: 401 }
            );
        }

        // Return user data (don't return password)
        return Response.json(
            {
                success: true,
                message: "Sign in successful",
                data: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("SIGNIN_ERROR:", error);
        return Response.json(
            {
                success: false,
                message: error.message || "An error occurred during sign in"
            },
            { status: 500 }
        );
    }
}
