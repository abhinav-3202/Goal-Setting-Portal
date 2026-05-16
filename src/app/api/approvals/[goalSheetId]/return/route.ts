import { Goal } from "@/src/models/Goal";
import { AuditLog } from "@/src/models/AuditLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option"; 
import dbConnect from "@/src/lib/dbConnect";

export async function POST(request: Request, { params }: { params: { goalSheetId: string } }) {
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

        // 2. Role-Based Authorization
        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return Response.json({
                success: false,
                message: "Unauthorized. Only managers can return goals."
            }, { status: 403 });
        }

        const body = await request.json();
        const { employeeId, cycleId, managerComment } = body; 

        if (!employeeId || !cycleId || !managerComment) {
            return Response.json({
                success: false,
                message: "Missing employeeId, cycleId, or required manager comment."
            }, { status: 400 });
        }

        // 3. Revert Goals back to 'draft'
        const updateResult = await Goal.updateMany(
            { employeeId, cycleId, status: "submitted" },
            {
                $set: {
                    status: "draft",
                    lockedAt: null
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: "No submitted goals found to return."
            }, { status: 404 });
        }

        // 4. Create Audit Log Entry for the Rework Request
        await AuditLog.create({
            entityId: employeeId, 
            entityType: 'Goal',
            changedBy: session.user._id,
            changes: [{
                field: 'status',
                old: 'submitted',
                new: 'draft (Returned for rework)'
            }],
            timestamp: new Date()
        });

        return Response.json({
            success: true,
            message: `Returned ${updateResult.modifiedCount} goals to draft status for rework.`
        }, { status: 200 });

    } catch (error) {
        console.error("RETURN_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while returning the goals."
        }, { status: 500 });
    }
}