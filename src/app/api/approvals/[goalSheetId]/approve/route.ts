import { Goal } from "@/src/models/Goal";
import { AuditLog } from "@/src/models/AuditLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; // Adjust path if needed
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
                message: "Unauthorized. Only managers can approve goals."
            }, { status: 403 });
        }

        // 3. Extract Identifiers
        const body = await request.json();
        const { employeeId, cycleId } = body; 

        if (!employeeId || !cycleId) {
            return Response.json({
                success: false,
                message: "Missing employeeId or cycleId in request body."
            }, { status: 400 });
        }

        // 4. Update Goals to 'approved' and lock them
        const updateResult = await Goal.updateMany(
            { employeeId, cycleId, status: "submitted" },
            {
                $set: {
                    status: "approved",
                    lockedAt: new Date()
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: "No submitted goals found to approve for this employee."
            }, { status: 404 });
        }

        // 5. Create Audit Log Entry
        await AuditLog.create({
            entityId: employeeId, // Grouping by employeeId for the sheet
            entityType: 'Goal',
            changedBy: session.user._id,
            changes: [{
                field: 'status',
                old: 'submitted',
                new: 'approved'
            }],
            timestamp: new Date()
        });

        return Response.json({
            success: true,
            message: `Successfully approved and locked ${updateResult.modifiedCount} goals.`
        }, { status: 200 });

    } catch (error) {
        console.error("APPROVAL_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while approving the goals."
        }, { status: 500 });
    }
}