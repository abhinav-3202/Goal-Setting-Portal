import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { CheckIn } from "@/src/models/CheckIn";
import { UserModel } from "@/src/models/User";
import { AuditLog } from "@/src/models/AuditLog";
import { Types } from "mongoose";

export async function GET(request: Request, { params }: { params: Promise<{ checkInId: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        // Only managers can view check-in comments
        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return Response.json({
                success: false,
                message: "Only managers can view check-in details"
            }, { status: 403 });
        }

        const { checkInId } = await params;

        // Fetch the check-in
        const checkIn = await CheckIn.findById(checkInId)
            .populate("employeeId", "name email department managerId")
            .populate("goalId");

        if (!checkIn) {
            return Response.json({
                success: false,
                message: "Check-in not found"
            }, { status: 404 });
        }

        // Authorization: manager can only view their team's check-ins
        if (session.user.role === "manager") {
            const employee = checkIn.employeeId as any;
            if (employee.managerId?.toString() !== session.user._id) {
                return Response.json({
                    success: false,
                    message: "You can only view check-ins from your reporting employees"
                }, { status: 403 });
            }
        }

        return Response.json({
            success: true,
            data: checkIn
        }, { status: 200 });

    } catch (error) {
        console.error("CHECK_IN_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ checkInId: string }> }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        // Only managers can add comments
        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return Response.json({
                success: false,
                message: "Only managers can add check-in comments"
            }, { status: 403 });
        }

        const { checkInId } = await params;
        const body = await request.json();
        const { comment } = body;

        // Validate comment
        if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
            return Response.json({
                success: false,
                message: "Comment is required and cannot be empty"
            }, { status: 400 });
        }

        if (comment.length > 2000) {
            return Response.json({
                success: false,
                message: "Comment cannot exceed 2000 characters"
            }, { status: 400 });
        }

        // Fetch the check-in
        const checkIn = await CheckIn.findById(checkInId).populate("employeeId", "managerId");
        if (!checkIn) {
            return Response.json({
                success: false,
                message: "Check-in not found"
            }, { status: 404 });
        }

        // Authorization: manager can only comment on their team's check-ins
        if (session.user.role === "manager") {
            const employee = checkIn.employeeId as any;
            if (employee.managerId?.toString() !== session.user._id) {
                return Response.json({
                    success: false,
                    message: "You can only add comments to check-ins from your reporting employees"
                }, { status: 403 });
            }
        }

        // Store the old comment for audit
        const oldComment = checkIn.managerComment || "";

        // Update the check-in with manager comment
        checkIn.managerComment = comment;
        await checkIn.save();

        // Create audit log
        try {
            await AuditLog.create({
                entityId: checkIn._id,
                entityType: "CheckIn",
                changedBy: new Types.ObjectId(session.user._id),
                changes: [
                    {
                        field: "managerComment",
                        old: oldComment,
                        new: comment
                    }
                ],
                timestamp: new Date()
            });
        } catch (auditError) {
            console.warn("Failed to create audit log:", auditError);
        }

        return Response.json({
            success: true,
            message: "Comment added successfully",
            data: checkIn
        }, { status: 200 });

    } catch (error) {
        console.error("CHECK_IN_COMMENT_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}
