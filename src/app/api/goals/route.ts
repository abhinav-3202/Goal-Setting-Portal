import { Goal } from "@/src/models/Goal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import dbConnect from "@/src/lib/dbConnect";

export async function GET(request: Request) {
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

        // 2. Extract Cycle ID from Query Params
        const { searchParams } = new URL(request.url);
        const cycleId = searchParams.get("cycleId");

        if (!cycleId) {
            return Response.json({
                success: false,
                message: "Missing cycleId parameter."
            }, { status: 400 });
        }

        // 3. Fetch Goals belonging ONLY to this employee for the given cycle
        const goals = await Goal.find({
            employeeId: session.user._id, // Secured by session, not trusting client input
            cycleId: cycleId
        }).sort({ createdAt: 1 });

        return Response.json({
            success: true,
            message: "Goals fetched successfully.",
            goals
        }, { status: 200 });

    } catch (error) {
        console.error("GOALS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while retrieving your goals."
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

        // 2. Role Authorization
        if (session.user.role !== "employee") {
            return Response.json({
                success: false,
                message: "Only employees can create personal goals."
            }, { status: 403 });
        }

        // 3. Parse and Validate Body
        const body = await request.json();
        const { cycleId, thrustArea, title, description, uom, target, weightage } = body;

        if (!cycleId || !thrustArea || !title || !uom || !target || !weightage) {
            return Response.json({
                success: false,
                message: "Missing required goal fields."
            }, { status: 400 });
        }

        // 4. Create New Draft Goal
        const newGoal = await Goal.create({
            employeeId: session.user._id, // Enforce current user
            cycleId,
            thrustArea,
            title,
            description,
            uom,
            target,
            weightage,
            status: "draft", // Always starts as draft
            isShared: false,
            sharedFrom: null
        });

        return Response.json({
            success: true,
            message: "Goal drafted successfully.",
            goal: newGoal
        }, { status: 201 });

    } catch (error) {
        console.error("GOALS_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while creating your goal."
        }, { status: 500 });
    }
}