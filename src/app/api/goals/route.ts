import { Goal } from "@/src/models/Goal";
import { Cycle } from "@/src/models/Cycle";
import { GoalSheet } from "@/src/models/GoalSheet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { assertGoalSettingOpen } from "@/lib/cycleGuard";
import { parseGoalSheet } from "@/lib/validataions/GoalSheet";

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

        // 2. Get all goal sheets for this employee with aggregated data
        const goalSheets = await GoalSheet.aggregate([
            // Match only current user's sheets
            { $match: { employeeId: session.user._id } },
            
            // Lookup cycle information
            {
                $lookup: {
                    from: 'cycles',
                    localField: 'cycleId',
                    foreignField: '_id',
                    as: 'cycle'
                }
            },
            
            // Unwind cycle array (convert from array to single doc)
            { $unwind: '$cycle' },
            
            // Lookup goals for this sheet
            {
                $lookup: {
                    from: 'goals',
                    let: { sheetEmployeeId: '$employeeId', sheetCycleId: '$cycleId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$employeeId', '$$sheetEmployeeId'] },
                                        { $eq: ['$cycleId', '$$sheetCycleId'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'goals'
                }
            },
            
            // Compute goal count and total weightage
            {
                $addFields: {
                    goalCount: { $size: '$goals' },
                    totalWeightage: { $sum: '$goals.weightage' },
                    cycleName: '$cycle.name'
                }
            },
            
            // Project the fields we need
            {
                $project: {
                    _id: 1,
                    status: 1,
                    cycleName: 1,
                    goalCount: 1,
                    totalWeightage: 1,
                    submittedAt: 1,
                    approvedAt: 1,
                    lockedAt: 1,
                    returnComment: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            
            // Sort by createdAt descending (newest first)
            { $sort: { createdAt: -1 } }
        ]);

        return Response.json({
            success: true,
            message: "Goal sheets fetched successfully.",
            data: goalSheets
        }, { status: 200 });

    } catch (error) {
        console.error("GOALS_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while retrieving your goal sheets."
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Authentication Check
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized. Please sign in first."
            }, { status: 403 });
        }

        // 2. Role Authorization
        if (session.user.role !== "employee") {
            return Response.json({
                success: false,
                message: "Only employees can create personal goals."
            }, { status: 403 });
        }

        // 3. Check if Goal-Setting Window is Open
        try {
            await assertGoalSettingOpen();
        } catch (error: any) {
            return Response.json({
                success: false,
                message: "Goal setting window is not currently open. Please wait for the next goal setting cycle."
            }, { status: 403 });
        }

        // 4. Parse and Validate Body with Zod schema
        const body = await request.json();
        const { cycleId, goals } = body;

        if (!cycleId) {
            return Response.json({
                success: false,
                message: "Missing cycleId."
            }, { status: 400 });
        }

        // Use Zod schema to validate goals array
        const validationResult = parseGoalSheet({ goals });
        if (!validationResult.success) {
            return Response.json({
                success: false,
                message: validationResult.error
            }, { status: 400 });
        }

        // 5. Create or Get GoalSheet
        let goalSheet = await GoalSheet.findOne({
            employeeId: session.user._id,
            cycleId
        });

        if (!goalSheet) {
            goalSheet = await GoalSheet.create({
                employeeId: session.user._id,
                cycleId,
                status: 'draft'
            });
        }

        // 6. Delete old goals for this sheet and create new ones
        await Goal.deleteMany({
            employeeId: session.user._id,
            cycleId
        });

        const createdGoals = await Goal.insertMany(
            validationResult.data.goals.map((goal: any) => ({
                employeeId: session.user._id,
                cycleId,
                thrustArea: goal.thrustArea,
                title: goal.title,
                description: goal.description || '',
                uom: goal.uom,
                target: goal.target,
                weightage: goal.weightage,
                status: 'draft',
                isShared: goal.isShared || false,
                sharedFrom: goal.sharedFrom || null
            }))
        );

        return Response.json({
            success: true,
            message: "Goal sheet saved successfully.",
            _id: goalSheet._id,
            goals: createdGoals
        }, { status: 201 });

    } catch (error) {
        console.error("GOALS_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while saving your goal sheet."
        }, { status: 500 });
    }
}