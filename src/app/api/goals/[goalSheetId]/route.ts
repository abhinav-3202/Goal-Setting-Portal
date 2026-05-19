import { Goal } from "@/src/models/Goal";
import { GoalSheet } from "@/src/models/GoalSheet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { parseGoalSheet } from "@/lib/validataions/GoalSheet";

// GET - Fetch goals for a goal sheet
export async function GET(request: Request, { params }: { params: Promise<{ goalSheetId: string }> }) {
    try {
        const { goalSheetId } = await params;
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        // Verify goalSheet exists and belongs to user
        const goalSheet = await GoalSheet.findOne({ _id: goalSheetId, employeeId: session.user._id });
        if (!goalSheet) {
            return Response.json({ success: false, message: "Goal sheet not found." }, { status: 404 });
        }

        // Get all goals for this sheet
        const goals = await Goal.find({
            employeeId: session.user._id,
            cycleId: goalSheet.cycleId
        });

        return Response.json({
            success: true,
            goals,
            goalSheet
        }, { status: 200 });

    } catch (error) {
        console.error("GOAL_SHEET_GET_ERROR:", error);
        return Response.json({ success: false, message: "Error fetching goal sheet." }, { status: 500 });
    }
}

// PATCH - Update all goals for a goal sheet
export async function PATCH(request: Request, { params }: { params: Promise<{ goalSheetId: string }> }) {
    try {
        const { goalSheetId } = await params;
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const { goals } = body;

        // Verify goalSheet exists and belongs to user
        const goalSheet = await GoalSheet.findOne({ _id: goalSheetId, employeeId: session.user._id });
        if (!goalSheet) {
            return Response.json({ success: false, message: "Goal sheet not found." }, { status: 404 });
        }

        // Prevent editing locked or approved sheets
        if (goalSheet.status === "locked") {
            return Response.json({
                success: false,
                message: "Goals are locked and cannot be edited. Contact your manager to request changes."
            }, { status: 403 });
        }

        if (goalSheet.status === "approved") {
            return Response.json({
                success: false,
                message: "Approved goals cannot be edited. Wait for the next cycle or contact your manager."
            }, { status: 403 });
        }

        // Only allow updating draft sheets
        if (goalSheet.status !== "draft") {
            return Response.json({
                success: false,
                message: "You can only edit goal sheets in draft status."
            }, { status: 403 });
        }

        // Use Zod schema to validate goals array
        const validationResult = parseGoalSheet({ goals });
        if (!validationResult.success) {
            return Response.json({
                success: false,
                message: validationResult.error
            }, { status: 400 });
        }

        // Delete old goals
        await Goal.deleteMany({
            employeeId: session.user._id,
            cycleId: goalSheet.cycleId
        });

        // Create new goals
        const createdGoals = await Goal.insertMany(
            validationResult.data.goals.map((goal: any) => ({
                employeeId: session.user._id,
                cycleId: goalSheet.cycleId,
                thrustArea: goal.thrustArea,
                title: goal.title,
                description: goal.description || '',
                uom: goal.uom,
                target: goal.target,
                weightage: goal.weightage,
                status: 'draft',
                isShared: goal.isShared || false,
                sharedFrom: goal.sharedFrom || null
            }))
        );

        return Response.json({
            success: true,
            message: "Goal sheet updated successfully.",
            _id: goalSheet._id,
            goals: createdGoals
        }, { status: 200 });

    } catch (error) {
        console.error("GOAL_SHEET_PATCH_ERROR:", error);
        return Response.json({ success: false, message: "Error updating goal sheet." }, { status: 500 });
    }
}
