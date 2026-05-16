import { Goal } from "@/src/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";

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
        const { cycleId } = body;

        if (!cycleId) {
            return Response.json({
                success: false,
                message: "Missing cycleId parameter."
            }, { status: 400 });
        }

        // 3. Fetch all current draft goals for this employee in this cycle
        const draftGoals = await Goal.find({
            employeeId: session.user._id,
            cycleId: cycleId,
            status: "draft"
        });

        if (draftGoals.length === 0) {
            return Response.json({
                success: false,
                message: "No draft goals found to submit."
            }, { status: 404 });
        }

        // 4. CRITICAL VALIDATION: Check Maximum Goals Rule
        if (draftGoals.length > 8) {
            return Response.json({
                success: false,
                message: `You can have a maximum of 8 goals. You currently have ${draftGoals.length}.`
            }, { status: 400 });
        }

        // 5. CRITICAL VALIDATION: Verify 100% Weightage Sum
        const totalWeightage = draftGoals.reduce((sum, goal) => sum + goal.weightage, 0);
        
        if (totalWeightage !== 100) {
            return Response.json({
                success: false,
                message: `Total weightage must equal exactly 100%. Your current total is ${totalWeightage}%.`
            }, { status: 400 });
        }

        // 6. Update all fetched drafts to 'submitted'
        const updateResult = await Goal.updateMany(
            { employeeId: session.user._id, cycleId: cycleId, status: "draft" },
            { $set: { status: "submitted" } }
        );

        return Response.json({
            success: true,
            message: `Successfully submitted ${updateResult.modifiedCount} goals for manager approval.`
        }, { status: 200 });

    } catch (error) {
        console.error("GOALS_SUBMIT_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while submitting your goals."
        }, { status: 500 });
    }
}