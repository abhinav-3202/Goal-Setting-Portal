import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import { getActiveCycle } from "@/lib/cycleGuard";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        // Get the active cycle using cycleGuard which provides activeQuarter
        const activeCycle = await getActiveCycle();

        if (!activeCycle) {
            return Response.json({
                success: false,
                message: "No active cycle found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            data: activeCycle
        }, { status: 200 });

    } catch (error) {
        console.error("CYCLES_ACTIVE_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while fetching active cycle"
        }, { status: 500 });
    }
}
