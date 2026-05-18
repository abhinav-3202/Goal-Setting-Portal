import { Goal } from "@/src/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option"; // Adjust path if your options are exported elsewhere
import dbConnect from "@/src/lib/dbConnect";
import mongoose from "mongoose";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        // Get all shared goals assigned to this employee
        const sharedGoals = await Goal.find({
            employeeId: session.user._id,
            isShared: true
        }).populate("sharedFrom", "name");

        return Response.json({
            success: true,
            data: sharedGoals
        }, { status: 200 });

    } catch (error) {
        console.error("SHARED_GOALS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while fetching shared goals"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Authentication Check
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 });
        }

        // 2. Role-Based Authorization
        if (session.user.role !== "admin") {
            return Response.json({
                success: false,
                message: "Only admins can push shared corporate goals."
            }, { status: 403 });
        }

        // 3. Payload Parsing & Validation
        const body = await request.json();
        const { cycleId, thrustArea, title, description, uom, target, targetEmployeeIds } = body;

        if (!cycleId || !targetEmployeeIds || targetEmployeeIds.length === 0) {
            return Response.json({
                success: false,
                message: "Missing required fields or target employees."
            }, { status: 400 });
        }

        // 4. Generate Master Reference ID
        const masterGoalId = new mongoose.Types.ObjectId();

        // 5. Construct Batch Data
        const sharedGoalsData = targetEmployeeIds.map((employeeId: string) => ({
            employeeId,
            cycleId,
            thrustArea,
            title,
            description,
            uom,
            target,
            weightage: 10, // Default minimum weightage so employee can balance the rest
            status: 'draft', 
            isShared: true,
            sharedFrom: masterGoalId,
        }));

        // 6. Batch Database Insert
        await Goal.insertMany(sharedGoalsData);

        return Response.json({
            success: true,
            message: `Shared goal successfully pushed to ${targetEmployeeIds.length} employees.`
        }, { status: 201 });

    } catch (error) {
        console.error("SHARED_GOALS_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while pushing shared goals."
        }, { status: 500 });
    }
}