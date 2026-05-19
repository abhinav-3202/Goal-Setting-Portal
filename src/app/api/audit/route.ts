import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { AuditLog } from "@/src/models/AuditLog";
import { GoalSheet } from "@/src/models/GoalSheet";
import { Goal } from "@/src/models/Goal";
import { UserModel } from "@/src/models/User";
import { Types } from "mongoose";

// Helper function to determine action from changes
function determineAction(changes: any[]): string {
    if (!changes || changes.length === 0) return "edited";
    
    for (const change of changes) {
        if (change.field === "status") {
            if (change.new === "approved") return "approved";
            if (change.new === "submitted") return "submitted";
            if (change.new === "draft" && change.old !== "draft") return "returned";
            if (change.new === "locked") return "locked";
        }
    }
    return "edited";
}

export async function GET(request: Request) {
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

        // 2. Extract query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const entityType = searchParams.get("entityType") as string | null;
        const action = searchParams.get("action") as string | null;
        const startDate = searchParams.get("startDate") as string | null;
        const endDate = searchParams.get("endDate") as string | null;

        // 3. Build filter query based on role
        let filterQuery: any = {};

        if (session.user.role === "admin") {
            // Admins see all audit logs
        } else if (session.user.role === "manager") {
            // Managers see audit logs for their team's goals
            const reportingEmployees = await UserModel.find({ managerId: session.user._id }).select("_id");
            const employeeIds = reportingEmployees.map(emp => emp._id);

            // Get goal sheets for their employees
            const goalSheets = await GoalSheet.find({
                employeeId: { $in: employeeIds }
            }).select("_id");
            const goalSheetIds = goalSheets.map(gs => gs._id);

            filterQuery.entityId = { $in: goalSheetIds };
        } else {
            // Employees see only their own audit logs
            const employeeGoals = await GoalSheet.find({
                employeeId: session.user._id
            }).select("_id");
            const employeeGoalIds = employeeGoals.map(eg => eg._id);

            filterQuery.entityId = { $in: employeeGoalIds };
        }

        // 4. Apply additional filters
        if (entityType) {
            filterQuery.entityType = entityType;
        }

        // 5. Date range filter
        const dateFilter: any = {};
        if (startDate) {
            dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
            dateFilter.$lte = endDateObj;
        }
        if (Object.keys(dateFilter).length > 0) {
            filterQuery.timestamp = dateFilter;
        }

        // 6. Fetch audit logs with pagination
        const skip = (page - 1) * limit;
        const auditLogs = await AuditLog.find(filterQuery)
            .populate("changedBy", "name email role")
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // 7. Transform audit logs to expected format and filter by action if needed
        const transformedLogs = auditLogs.map((log: any) => {
            const determinedAction = determineAction(log.changes);
            return {
                _id: log._id.toString(),
                entityType: log.entityType,
                entityId: log.entityId.toString(),
                action: determinedAction,
                changedBy: {
                    name: log.changedBy?.name || "Unknown User",
                    email: log.changedBy?.email || "unknown@example.com",
                    role: log.changedBy?.role || "unknown"
                },
                changes: log.changes || [],
                timestamp: log.timestamp.toISOString()
            };
        });

        // 8. Apply action filter after transformation (for client-side consistency)
        let filteredLogs = transformedLogs;
        if (action) {
            filteredLogs = transformedLogs.filter(log => log.action === action);
        }

        // 9. Get total count for pagination
        const totalCount = await AuditLog.countDocuments(filterQuery);

        return Response.json({
            success: true,
            message: "Audit logs fetched successfully",
            data: filteredLogs,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        }, { status: 200 });

    } catch (error) {
        console.error("AUDIT_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while fetching audit logs"
        }, { status: 500 });
    }
}
