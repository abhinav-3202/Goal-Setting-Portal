import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { GoalSheet } from "@/src/models/GoalSheet";
import { Goal } from "@/src/models/Goal";
import { UserModel } from "@/src/models/User";
import { AuditLog } from "@/src/models/AuditLog";
import { Types } from "mongoose";
import { z } from "zod";

// Schema for return request body
const returnGoalsSchema = z.object({
    returnComment: z.string().min(1, "Return comment is required").max(1000, "Comment too long")
});

export async function POST(request: Request, { params }: { params: { goalSheetId: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Authentication Check
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        // 2. Role-Based Authorization
        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return Response.json({
                success: false,
                message: "Only managers can return goals"
            }, { status: 403 });
        }

        // 3. Parse and validate request body
        const body = await request.json();
        const validationResult = returnGoalsSchema.safeParse(body);
        if (!validationResult.success) {
            return Response.json({
                success: false,
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { returnComment } = validationResult.data;
        const { goalSheetId } = params;

        // 4. Fetch GoalSheet
        const goalSheet = await GoalSheet.findById(goalSheetId).populate("employeeId");
        if (!goalSheet) {
            return Response.json({
                success: false,
                message: "Goal sheet not found"
            }, { status: 404 });
        }

        // 5. Authorization - verify manager/admin can return this employee's goals
        if (session.user.role === "manager") {
            const employee = goalSheet.employeeId as any;
            if (employee.managerId?.toString() !== session.user._id) {
                return Response.json({
                    success: false,
                    message: "You can only return goals from your reporting employees"
                }, { status: 403 });
            }
        }

        // 6. Check if goal sheet can be returned (submitted or approved status)
        if (goalSheet.status !== "submitted" && goalSheet.status !== "approved") {
            return Response.json({
                success: false,
                message: `Goal sheet cannot be returned from ${goalSheet.status} status. It must be submitted or approved.`
            }, { status: 400 });
        }

        // 7. Store old status for audit log
        const oldStatus = goalSheet.status;

        // 8. Update GoalSheet - return to draft status with comment
        const now = new Date();
        goalSheet.status = "draft";
        goalSheet.returnComment = returnComment;
        await goalSheet.save();

        // 9. Update all associated Goals back to draft
        await Goal.updateMany(
            { employeeId: goalSheet.employeeId._id, cycleId: goalSheet.cycleId },
            { status: "draft" }
        );

        // 10. Create Audit Log
        try {
            await AuditLog.create({
                entityId: goalSheet._id,
                entityType: "Goal",
                changedBy: new Types.ObjectId(session.user._id),
                changes: [
                    {
                        field: "status",
                        old: oldStatus,
                        new: "draft"
                    },
                    {
                        field: "returnComment",
                        old: goalSheet.returnComment || "none",
                        new: returnComment
                    }
                ],
                timestamp: now
            });
        } catch (auditError) {
            console.warn("Failed to create audit log:", auditError);
            // Don't fail the request if audit log fails
        }

        return Response.json({
            success: true,
            message: "Goals returned to employee for revision",
            data: {
                goalSheetId: goalSheet._id,
                status: "draft",
                returnComment: returnComment,
                returnedAt: now
            }
        }, { status: 200 });

    } catch (error) {
        console.error("RETURN_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}
