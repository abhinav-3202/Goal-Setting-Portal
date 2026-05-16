import { Goal } from "@/src/models/Goal";
import { User } from "@/src/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import dbConnect from "@/src/lib/dbConnect";

export async function GET(request: Request) {
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
                message: "Unauthorized. Only managers can view pending approvals."
            }, { status: 403 });
        }

        // 3. Find employees who report to this manager
        // (If it's an admin, you might eventually bypass this to see all, but we will stick to manager scope for now)
        const reportingEmployees = await User.find({ managerId: session.user._id }).select('_id');
        const employeeIds = reportingEmployees.map(emp => emp._id);

        // 4. Fetch Submitted Goals for those specific employees
        const pendingGoals = await Goal.find({
            employeeId: { $in: employeeIds },
            status: "submitted"
        })
        .populate("employeeId", "name email department") // Attach employee details so the manager knows whose goal it is
        .sort({ createdAt: 1 }); // Oldest submissions first

        return Response.json({
            success: true,
            message: "Pending approvals fetched successfully.",
            pendingGoals
        }, { status: 200 });

    } catch (error) {
        console.error("APPROVALS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while retrieving pending approvals."
        }, { status: 500 });
    }
}