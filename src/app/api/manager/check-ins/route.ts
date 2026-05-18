import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { CheckIn } from "@/src/models/CheckIn";
import { UserModel } from "@/src/models/User";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "manager") {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const url = new URL(request.url);
        const quarter = url.searchParams.get("quarter") || "Q1";

        // Get all employees managed by this manager
        const managedEmployees = await UserModel.find({
            managerId: session.user._id,
            role: "employee"
        }).select("_id name email");

        const managedEmployeeIds = managedEmployees.map((e) => e._id);

        // Fetch check-ins for managed employees in the given quarter
        const checkIns = await CheckIn.find({
            employeeId: { $in: managedEmployeeIds },
            quarter
        })
            .populate("employeeId", "name email department")
            .populate("goalId")
            .sort({ createdAt: -1 });

        return Response.json({
            success: true,
            data: checkIns
        }, { status: 200 });

    } catch (error) {
        console.error("MANAGER_CHECK_INS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred"
        }, { status: 500 });
    }
}

