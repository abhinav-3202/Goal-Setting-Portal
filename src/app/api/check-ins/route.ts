import { CheckIn } from "@/src/models/CheckIn";
import { Goal } from "@/src/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option"; // Using option.ts based on your screenshot
import dbConnect from "@/src/lib/dbConnect";

// GET: Fetch all check-ins for the logged-in employee
export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Auth Check
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 401 });
        }

        // 2. Fetch Check-Ins
        // We populate the goal details so the frontend can display what goal this check-in belongs to
        const checkIns = await CheckIn.find({ employeeId: session.user._id })
            .populate("goalId", "title thrustArea target uom")
            .sort({ createdAt: -1 });

        return Response.json({
            success: true,
            message: "Check-ins fetched successfully.",
            checkIns
        }, { status: 200 });

    } catch (error) {
        console.error("CHECKINS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while retrieving check-ins."
        }, { status: 500 });
    }
}

// POST: Submit a new check-in for a goal
export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Auth & Role Check
        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }
        if (session.user.role !== "employee") {
            return Response.json({ success: false, message: "Only employees can log check-ins." }, { status: 403 });
        }

        const body = await request.json();
        const { goalId, cycleId, quarter, actual, statusTag } = body;

        // 2. Basic Validation
        if (!goalId || !cycleId || !quarter || !actual) {
            return Response.json({
                success: false,
                message: "Missing required fields (goalId, cycleId, quarter, actual)."
            }, { status: 400 });
        }

        // 3. Fetch the Goal to calculate the score
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return Response.json({ success: false, message: "Goal not found." }, { status: 404 });
        }

        // 4. Score Computation Engine (Inline for safety, based on your Phase 2 spec)
        let computedScore = 0;
        const targetNum = Number(goal.target);
        const actualNum = Number(actual);

        if (targetNum !== 0 && !isNaN(targetNum) && !isNaN(actualNum)) {
            if (goal.uom === 'numeric_min') computedScore = actualNum / targetNum;
            if (goal.uom === 'numeric_max') computedScore = targetNum / actualNum;
        } else if (goal.uom === 'zero-based') {
            computedScore = actualNum === 0 ? 1 : 0;
        }

        // Cap score logically (e.g., max 150% achievement)
        computedScore = Math.max(0, Math.min(computedScore, 1.5)) * 100;

        // 5. Upsert Check-In (Create if new, Update if already exists for this quarter)
        const checkIn = await CheckIn.findOneAndUpdate(
            { goalId, quarter, employeeId: session.user._id }, // Search criteria
            {
                $set: {
                    cycleId,
                    actual,
                    statusTag: statusTag || 'on_track',
                    computedScore
                }
            },
            { new: true, upsert: true, runValidators: true } // Upsert magic
        );

        return Response.json({
            success: true,
            message: `Successfully logged check-in for ${quarter}.`,
            checkIn
        }, { status: 200 });

    } catch (error) {
        console.error("CHECKINS_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while saving your check-in."
        }, { status: 500 });
    }
}