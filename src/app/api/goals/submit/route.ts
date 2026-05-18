import { Goal } from "@/src/models/Goal";
import { GoalSheet } from "@/src/models/GoalSheet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { Types } from "mongoose";

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

        // 2. Role Authorization
        if (session.user.role !== "employee") {
            return Response.json({
                success: false,
                message: "Only employees can submit goal sheets."
            }, { status: 403 });
        }

        const body = await request.json();
        const { goalSheetId } = body;

        if (!goalSheetId) {
            return Response.json({
                success: false,
                message: "Missing goalSheetId parameter."
            }, { status: 400 });
        }

        // 3. Get the goal sheet
        const goalSheet = await GoalSheet.findById(goalSheetId);
        if (!goalSheet) {
            return Response.json({
                success: false,
                message: "Goal sheet not found."
            }, { status: 404 });
        }

        // 4. Verify ownership
        const userId = session.user._id || (session.user as any).id;
        if (!userId || goalSheet.employeeId.toString() !== userId.toString()) {
            return Response.json({
                success: false,
                message: "Unauthorized. This is not your goal sheet."
            }, { status: 403 });
        }

        // 5. Fetch all current draft goals for this sheet
        const draftGoals = await Goal.find({
            employeeId: userId,
            cycleId: goalSheet.cycleId,
            status: "draft"
        });

        if (draftGoals.length === 0) {
            return Response.json({
                success: false,
                message: "No draft goals found to submit."
            }, { status: 404 });
        }

        // 6. CRITICAL VALIDATION: Check Maximum Goals Rule
        if (draftGoals.length > 8) {
            return Response.json({
                success: false,
                message: `You can have a maximum of 8 goals. You currently have ${draftGoals.length}.`
            }, { status: 400 });
        }

        // 7. CRITICAL VALIDATION: Verify 100% Weightage Sum
        const totalWeightage = draftGoals.reduce((sum, goal) => sum + goal.weightage, 0);
        
        if (totalWeightage !== 100) {
            return Response.json({
                success: false,
                message: `Total weightage must equal exactly 100%. Your current total is ${totalWeightage}%.`
            }, { status: 400 });
        }

        // 8. Update all fetched drafts to 'submitted'
        await Goal.updateMany(
            { employeeId: session.user._id, cycleId: goalSheet.cycleId, status: "draft" },
            { $set: { status: "submitted" } }
        );

        // 9. Update goal sheet status to submitted
        goalSheet.status = "submitted";
        goalSheet.submittedAt = new Date();
        await goalSheet.save();

        return Response.json({
            success: true,
            message: `Successfully submitted ${draftGoals.length} goals for manager approval.`
        }, { status: 200 });

    } catch (error) {
        console.error("GOALS_SUBMIT_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while submitting your goals."
        }, { status: 500 });
    }
}