import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { GoalSheet } from "@/src/models/GoalSheet";
import { Goal } from "@/src/models/Goal";
import { UserModel } from "@/src/models/User";
import { AuditLog } from "@/src/models/AuditLog";
import { parseGoalSheet } from "@/lib/validataions/GoalSheet";
import { Types } from "mongoose";

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
                message: "Only managers can approve goals"
            }, { status: 403 });
        }

        const { goalSheetId } = params;
        const body = await request.json();
        const { goals: editedGoals } = body;

        // 3. Fetch GoalSheet
        const goalSheet = await GoalSheet.findById(goalSheetId).populate("employeeId");
        if (!goalSheet) {
            return Response.json({
                success: false,
                message: "Goal sheet not found"
            }, { status: 404 });
        }

        // 4. Authorization - verify manager/admin can approve this employee's goals
        if (session.user.role === "manager") {
            const employee = goalSheet.employeeId as any;
            if (employee.managerId?.toString() !== session.user._id) {
                return Response.json({
                    success: false,
                    message: "You can only approve goals from your reporting employees"
                }, { status: 403 });
            }
        }

        // 5. Check if goal sheet is in correct status (submitted)
        if (goalSheet.status !== "submitted") {
            return Response.json({
                success: false,
                message: `Goal sheet cannot be approved from ${goalSheet.status} status. It must be submitted.`
            }, { status: 400 });
        }

        // 6. Validate weightage if goals were edited inline
        if (editedGoals && Array.isArray(editedGoals)) {
            // Use Zod schema to validate goals array
            const validationResult = parseGoalSheet({ goals: editedGoals });
            if (!validationResult.success) {
                return Response.json({
                    success: false,
                    message: `Invalid goals: ${validationResult.error}`
                }, { status: 400 });
            }

            // 7. Update Goals with inline edited values and lock them
            const now = new Date();
            for (const editedGoal of validationResult.data.goals) {
                await Goal.findByIdAndUpdate(
                    editedGoal._id || editedGoal.id,
                    {
                        target: editedGoal.target,
                        weightage: editedGoal.weightage,
                        status: "locked",
                        lockedAt: now
                    }
                );
            }
        } else {
            // 7. If no edits, just lock all associated goals
            const now = new Date();
            await Goal.updateMany(
                { employeeId: goalSheet.employeeId._id, cycleId: goalSheet.cycleId },
                { 
                    status: "locked",
                    lockedAt: now
                }
            );
        }

        // 8. Update GoalSheet to locked (not just approved)
        const now = new Date();
        goalSheet.status = "locked";
        goalSheet.approvedAt = now;
        goalSheet.lockedAt = now;
        await goalSheet.save();

        // 9. Create Audit Log
        try {
            await AuditLog.create({
                entityId: goalSheet._id,
                entityType: "Goal",
                changedBy: new Types.ObjectId(session.user._id),
                changes: [
                    {
                        field: "status",
                        old: "submitted",
                        new: "locked"
                    },
                    {
                        field: "lockedAt",
                        old: "null",
                        new: now.toISOString()
                    }
                ],
                timestamp: now
            });
        } catch (auditError) {
            console.warn("Failed to create audit log:", auditError);
        }

        return Response.json({
            success: true,
            message: "Goals approved and locked successfully",
            data: {
                goalSheetId: goalSheet._id,
                status: "locked",
                approvedAt: now,
                lockedAt: now
            }
        }, { status: 200 });

    } catch (error) {
        console.error("APPROVE_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}
