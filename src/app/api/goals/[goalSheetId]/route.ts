import { Goal } from "@/src/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import dbConnect from "@/src/lib/dbConnect";

export async function PATCH(request: Request, { params }: { params: { goalSheetId: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const goalId = params.goalSheetId; 

        // 1. Find the exact goal and ensure it belongs to this employee
        const existingGoal = await Goal.findOne({ _id: goalId, employeeId: session.user._id });

        if (!existingGoal) {
            return Response.json({ success: false, message: "Goal not found." }, { status: 404 });
        }

        // 2. Prevent editing if it's already locked, submitted, or approved
        if (existingGoal.status !== "draft") {
            return Response.json({ 
                success: false, 
                message: "You cannot edit a goal that has already been submitted or approved." 
            }, { status: 403 });
        }

        // 3. Handle Admin-Shared Goals logic
        // Employees can ONLY update weightage on shared goals
        let updateData = { ...body };
        if (existingGoal.isShared) {
            updateData = { weightage: body.weightage }; 
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            goalId, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        );

        return Response.json({
            success: true,
            message: "Goal updated successfully.",
            goal: updatedGoal
        }, { status: 200 });

    } catch (error) {
        console.error("GOAL_PATCH_ERROR:", error);
        return Response.json({ success: false, message: "Error updating goal." }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { goalSheetId: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const goalId = params.goalSheetId;

        const existingGoal = await Goal.findOne({ _id: goalId, employeeId: session.user._id });

        if (!existingGoal) {
            return Response.json({ success: false, message: "Goal not found." }, { status: 404 });
        }

        if (existingGoal.status !== "draft") {
            return Response.json({ 
                success: false, 
                message: "Cannot delete a goal that is not in draft status." 
            }, { status: 403 });
        }

        if (existingGoal.isShared) {
            return Response.json({ 
                success: false, 
                message: "You cannot delete a mandatory shared corporate goal." 
            }, { status: 403 });
        }

        await Goal.findByIdAndDelete(goalId);

        return Response.json({
            success: true,
            message: "Goal deleted successfully."
        }, { status: 200 });

    } catch (error) {
        console.error("GOAL_DELETE_ERROR:", error);
        return Response.json({ success: false, message: "Error deleting goal." }, { status: 500 });
    }
}