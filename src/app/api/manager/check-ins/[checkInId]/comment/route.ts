import { CheckIn } from "@/src/models/CheckIn"; // Switched back to standard naming
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";

export async function POST(request: Request, { params }: { params: { checkInId: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return Response.json({ success: false, message: "Forbidden. Managers only." }, { status: 403 });
        }

        const { checkInId } = params;
        const body = await request.json();
        const { comment } = body; 

        const [employeeId, quarter] = checkInId.split("-");

        if (!employeeId || !quarter) {
            return Response.json({ 
                success: false, 
                message: "Invalid check-in ID format." 
            }, { status: 400 });
        }

        // Apply comment using standard CheckIn model
        const updateResult = await CheckIn.updateMany(
            { employeeId: employeeId, quarter: quarter },
            { $set: { managerComment: comment } }
        );

        return Response.json({
            success: true,
            message: `Successfully saved comment to ${updateResult.modifiedCount} check-in documents.`
        }, { status: 200 });

    } catch (error) {
        console.error("MANAGER_COMMENT_ERROR:", error);
        return Response.json({ success: false, message: "Error saving comment." }, { status: 500 });
    }
}