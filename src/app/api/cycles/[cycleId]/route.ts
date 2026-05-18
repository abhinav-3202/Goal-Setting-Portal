import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { Cycle } from "@/src/models/Cycle";

export async function PATCH(request: Request, { params }: { params: Promise<{ cycleId: string }> }) {
    try {
        const { cycleId } = await params;
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "admin") {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const body = await request.json();
        const { isActive } = body;

        // If making active, deactivate others
        if (isActive) {
            await Cycle.updateMany({ _id: { $ne: cycleId } }, { isActive: false });
        }

        const cycle = await Cycle.findByIdAndUpdate(
            cycleId,
            { isActive },
            { new: true }
        );

        if (!cycle) {
            return Response.json({
                success: false,
                message: "Cycle not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Cycle updated successfully",
            data: cycle
        }, { status: 200 });

    } catch (error) {
        console.error("CYCLES_PATCH_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while updating cycle"
        }, { status: 500 });
    }
}
