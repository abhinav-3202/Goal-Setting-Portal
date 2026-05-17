import { Cycle } from "@/src/models/Cycle"; // Switched back to standard naming
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        // Fetch using the standard Cycle model
        const activeCycle = await Cycle.findOne({ isActive: true });

        if (!activeCycle) {
            return Response.json({ success: false, message: "No active cycle found." }, { status: 404 });
        }

        const phaseToQuarterMap: Record<string, string> = {
            'q1': 'Q1',
            'q2': 'Q2',
            'q3': 'Q3',
            'q4_annual': 'Q4'
        };

        return Response.json({
            _id: activeCycle._id,
            name: activeCycle.name,
            phase: activeCycle.phase,
            activeQuarter: phaseToQuarterMap[activeCycle.phase] || 'Q1'
        }, { status: 200 });

    } catch (error) {
        console.error("ACTIVE_CYCLE_GET_ERROR:", error);
        return Response.json({ success: false, message: "Error fetching active cycle." }, { status: 500 });
    }
}