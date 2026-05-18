import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { Goal } from "@/src/models/Goal";

export async function POST(request: Request, { params }: { params: Promise<{ goalId: string }> }) {
    try {
        const { goalId } = await params;
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const body = await request.json();
        const { weightage } = body;

        if (!weightage || weightage < 10 || weightage > 100) {
            return Response.json({
                success: false,
                message: "Weightage must be between 10% and 100%"
            }, { status: 400 });
        }

        // Update the shared goal with employee's weightage
        const goal = await Goal.findByIdAndUpdate(
            goalId,
            { weightage },
            { new: true }
        );

        if (!goal) {
            return Response.json({
                success: false,
                message: "Goal not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Goal accepted successfully",
            data: goal
        }, { status: 200 });

    } catch (error) {
        console.error("ACCEPT_GOAL_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while accepting goal"
        }, { status: 500 });
    }
}
