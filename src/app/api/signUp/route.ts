import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/src/lib/dbConnect"; // Adjust path according to your structure
import { UserModel } from "@/src/models/User";
import { signUpSchema } from "@/src/schemas/signUpSchema"; // Adjust path

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // 1. Validate incoming form data against Zod Schema
    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username, name, email, password, role, department } = result.data;

    // 2. Check if a user already exists with this email
    const existingUserByEmail = await UserModel.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: `This email is already registered via ${existingUserByEmail.authProvider}.` 
        },
        { status: 400 }
      );
    }

    // 3. Check if username is taken (since username is unique in your Mongoose schema)
    const existingUserByUsername = await UserModel.findOne({ username });
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, message: "Username is already taken." },
        { status: 400 }
      );
    }

    // 4. Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create the user record with authProvider set to "credentials"
    const newUser = await UserModel.create({
      username,
      name,
      email,
      password: hashedPassword,
      role,
      department,
      authProvider: "credentials", // Explicitly hardcoded here
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "User registered successfully!", 
        userId: newUser._id 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error during registration." },
      { status: 500 }
    );
  }
}