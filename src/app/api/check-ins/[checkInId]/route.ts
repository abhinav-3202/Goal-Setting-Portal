import { CheckIn } from "@/src/models/CheckIn";
import { Goal } from "@/src/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option"; // Using option.ts based on your screenshot
import dbConnect from "@/src/lib/dbConnect";

// PATCH: Update an existing check-in (e.g., fixing a typo in the actual value)
export async function PATCH(request: Request, { params }: { params: { checkInId: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Auth Check
        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const { checkInId } = params;
        const body = await request.json();
        const { actual, statusTag } = body;

        // 2. Fetch the existing check-in and verify ownership! (Security first)
        const existingCheckIn = await CheckIn.findOne({ 
            _id: checkInId, 
            employeeId: session.user._id 
        });

        if (!existingCheckIn) {
            return Response.json({ success: false, message: "Check-in not found or unauthorized." }, { status: 404 });
        }

        // 3. Prepare update data
        let updateData: any = {};
        if (statusTag) updateData.statusTag = statusTag;

        // 4. If they updated the 'actual' value, we MUST recalculate the score
        if (actual !== undefined) {
            updateData.actual = actual;

            const goal = await Goal.findById(existingCheckIn.goalId);
            if (goal) {
                let computedScore = 0;
                const targetNum = Number(goal.target);
                const actualNum = Number(actual);

                if (targetNum !== 0 && !isNaN(targetNum) && !isNaN(actualNum)) {
                    if (goal.uom === 'numeric_min') computedScore = actualNum / targetNum;
                    if (goal.uom === 'numeric_max') computedScore = targetNum / actualNum;
                } else if (goal.uom === 'zero-based') {
                    computedScore = actualNum === 0 ? 1 : 0;
                }

                // Cap at 150%
                updateData.computedScore = Math.max(0, Math.min(computedScore, 1.5)) * 100;
            }
        }

        // 5. Apply the update
        const updatedCheckIn = await CheckIn.findByIdAndUpdate(
            checkInId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return Response.json({
            success: true,
            message: "Check-in updated successfully.",
            checkIn: updatedCheckIn
        }, { status: 200 });

    } catch (error) {
        console.error("CHECKIN_PATCH_ERROR:", error);
        return Response.json({ success: false, message: "Error updating check-in." }, { status: 500 });
    }
}

// DELETE: Remove a check-in if made by mistake
export async function DELETE(request: Request, { params }: { params: { checkInId: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Auth Check
        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const { checkInId } = params;

        // 2. Delete the check-in ONLY IF it belongs to the logged-in user
        const deletedCheckIn = await CheckIn.findOneAndDelete({
            _id: checkInId,
            employeeId: session.user._id
        });

        if (!deletedCheckIn) {
            return Response.json({ success: false, message: "Check-in not found or unauthorized." }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Check-in deleted successfully."
        }, { status: 200 });

    } catch (error) {
        console.error("CHECKIN_DELETE_ERROR:", error);
        return Response.json({ success: false, message: "Error deleting check-in." }, { status: 500 });
    }
}