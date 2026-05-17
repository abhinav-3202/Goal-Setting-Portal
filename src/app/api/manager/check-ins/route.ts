import { UserModel } from "@/src/models/User";
import { Goal } from "@/src/models/Goal";
import { CheckIn } from "@/src/models/CheckIn";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option"; // Using option.ts based on your earlier screenshot
import dbConnect from "@/src/lib/dbConnect";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Auth Check
        if (!session || !session.user) {
            return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        // 2. Role Authorization
        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return Response.json({ success: false, message: "Forbidden. Managers only." }, { status: 403 });
        }

        // 3. Extract the target quarter from the URL (?quarter=Q1)
        const { searchParams } = new URL(request.url);
        const quarter = searchParams.get("quarter");

        if (!quarter) {
            return Response.json({ success: false, message: "Quarter parameter is required." }, { status: 400 });
        }

        // 4. Fetch the data pipeline
        // Step A: Get all employees reporting to this manager
        const teamMembers = await UserModel.find({ managerId: session.user._id }).lean();
        const employeeIds = teamMembers.map(emp => emp._id);

        if (employeeIds.length === 0) {
            return Response.json([], { status: 200 }); // Return empty array if no direct reports
        }

        // Step B: Fetch locked/approved goals for these specific employees
        const teamGoals = await Goal.find({
            employeeId: { $in: employeeIds },
            status: { $in: ['approved', 'locked'] }
        }).lean();

        // Step C: Fetch the check-ins ONLY for the requested quarter
        const teamCheckIns = await CheckIn.find({
            employeeId: { $in: employeeIds },
            quarter: quarter
        }).lean();

        // 5. Morph the flat database data into the exact `TeamMember[]` format the UI expects
        const formattedTeamMembers = teamMembers.map(emp => {
            const empGoals = teamGoals.filter(g => g.employeeId.toString() === emp._id.toString());
            const empCheckIns = teamCheckIns.filter(c => c.employeeId.toString() === emp._id.toString());

            // If they have check-ins, grab the manager's comment from the first one to represent the quarter
            const hasCheckIn = empCheckIns.length > 0;
            const quarterComment = hasCheckIn ? empCheckIns[0].managerComment : "";

            // Map individual goals and attach their specific check-in data (actuals & score)
            const mappedGoals = empGoals.map(goal => {
                const checkInForGoal = empCheckIns.find(c => c.goalId.toString() === goal._id.toString());
                return {
                    ...goal,
                    actual: checkInForGoal?.actual || null,
                    statusTag: checkInForGoal?.statusTag || 'not_started',
                    computedScore: checkInForGoal?.computedScore || 0
                };
            });

            return {
                employeeId: emp._id,
                employeeName: emp.name,
                department: emp.department,
                // Composite ID used to tell the frontend where to POST the manager's comment later
                checkInId: hasCheckIn ? `${emp._id}-${quarter}` : undefined, 
                isManagerDone: !!quarterComment && quarterComment.length > 0,
                managerComment: quarterComment,
                goals: mappedGoals
            };
        });

        // The UI explicitly expects a direct array: .then((data) => setMembers(Array.isArray(data) ? data : []))
        return Response.json(formattedTeamMembers, { status: 200 });

    } catch (error) {
        console.error("MANAGER_CHECKINS_GET_ERROR:", error);
        return Response.json({ success: false, message: "Error fetching team check-ins." }, { status: 500 });
    }
}