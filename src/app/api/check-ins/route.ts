import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { CheckIn } from "@/src/models/CheckIn";
import { Goal } from "@/src/models/Goal";
import { GoalSheet } from "@/src/models/GoalSheet";
import { assertCheckInWindowOpen } from "@/lib/cycleGuard";
import { Types } from "mongoose";

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

        const url = new URL(request.url);
        const quarter = url.searchParams.get("quarter") || "Q1";

        // Fetch check-ins for the employee in the given quarter
        const checkIns = await CheckIn.find({
            employeeId: session.user._id,
            quarter
        }).populate("goalId");

        return Response.json({
            success: true,
            data: checkIns
        }, { status: 200 });

    } catch (error) {
        console.error("CHECK_INS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const body = await request.json();
        const { goalSheetId, quarter, goals } = body;

        if (!goalSheetId || !quarter || !Array.isArray(goals)) {
            return Response.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }

        // Check if Check-In Window is Open for this Quarter
        try {
            await assertCheckInWindowOpen(quarter);
        } catch (error: any) {
            return Response.json({
                success: false,
                message: `Check-in window for ${quarter} is not currently open. Please wait for the designated check-in period.`
            }, { status: 403 });
        }

        // Get the goal sheet to retrieve cycleId
        const goalSheetRecord = await GoalSheet.findById(goalSheetId).select("cycleId");
        if (!goalSheetRecord) {
            return Response.json({
                success: false,
                message: "Goal sheet not found"
            }, { status: 404 });
        }

        // Create or update check-in records for each goal
        const savedCheckIns = [];
        
        for (const goal of goals) {
            // 1. Save check-in for the primary goal
            const checkIn = await CheckIn.findOneAndUpdate(
                { goalId: goal.goalId, employeeId: session.user._id, quarter },
                {
                    goalId: goal.goalId,
                    employeeId: session.user._id,
                    cycleId: goalSheetRecord.cycleId,
                    quarter,
                    actual: goal.actual,
                    statusTag: goal.statusTag,
                    submittedAt: new Date(),
                    status: "submitted"
                },
                { upsert: true, new: true }
            );
            savedCheckIns.push(checkIn);

            // 2. Sync achievement to all shared copies of this goal
            // Find all goals that were shared FROM this goal
            const sharedGoals = await Goal.find({
                sharedFrom: new Types.ObjectId(goal.goalId),
                cycleId: goalSheetRecord.cycleId
            }).select("_id employeeId");

            // Update check-ins for all employees who received this shared goal
            for (const sharedGoal of sharedGoals) {
                await CheckIn.findOneAndUpdate(
                    { goalId: sharedGoal._id, employeeId: sharedGoal.employeeId, quarter },
                    {
                        goalId: sharedGoal._id,
                        employeeId: sharedGoal.employeeId,
                        cycleId: goalSheetRecord.cycleId,
                        quarter,
                        actual: goal.actual, // Sync the same actual value
                        statusTag: goal.statusTag, // Sync the same status
                        submittedAt: new Date(),
                        status: "submitted"
                    },
                    { upsert: true, new: true }
                );
            }
        }

        return Response.json({
            success: true,
            message: "Check-in submitted successfully. Achievement synced to shared goals.",
            data: savedCheckIns
        }, { status: 201 });

    } catch (error) {
        console.error("CHECK_INS_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}
