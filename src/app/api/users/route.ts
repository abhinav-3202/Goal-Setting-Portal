import { UserModel } from "@/src/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option"; // Adjust path based on your authOptions location
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
        // Both admins and managers might need to fetch user lists for assignments/approvals
        if (session.user.role !== "admin" && session.user.role !== "manager") {
            return Response.json({
                success: false,
                message: "Unauthorized. You do not have permission to view the user directory."
            }, { status: 403 });
        }

        // 3. Extract Query Parameters (e.g., ?role=employee)
        const { searchParams } = new URL(request.url);
        const roleFilter = searchParams.get("role");

        // Build dynamic query object
        const query: any = {};
        if (roleFilter) {
            query.role = roleFilter;
        }

        // 4. Fetch Users
        // Using .select() to only return necessary frontend details, keeping the query fast
        const users = await UserModel.find(query)
            .select("name email department role") 
            .sort({ name: 1 }); // Alphabetical sort

        return Response.json({
            success: true,
            message: "Users fetched successfully.",
            users
        }, { status: 200 });

    } catch (error) {
        console.error("USERS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while retrieving the user list."
        }, { status: 500 });
    }
}