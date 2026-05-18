import dbConnect from "@/src/lib/dbConnect";
import { UserModel } from "@/src/models/User";
import { Cycle } from "@/src/models/Cycle";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === "production") {
            return Response.json({
                success: false,
                message: "Seeding is not allowed in production"
            }, { status: 403 });
        }

        await dbConnect();

        // Clear existing data (optional)
        // await UserModel.deleteMany({});
        // await Cycle.deleteMany({});

        // Create test users
        const hashedPassword = await bcrypt.hash("password123", 10);

        const users = [
            {
                name: "Admin User",
                email: "admin@test.com",
                password: hashedPassword,
                role: "admin",
                department: "Management",
                authProvider: "credentials"
            },
            {
                name: "Manager User",
                email: "manager@test.com",
                password: hashedPassword,
                role: "manager",
                department: "Engineering",
                authProvider: "credentials"
            },
            {
                name: "Employee One",
                email: "emp1@test.com",
                password: hashedPassword,
                role: "employee",
                department: "Engineering",
                authProvider: "credentials"
            },
            {
                name: "Employee Two",
                email: "emp2@test.com",
                password: hashedPassword,
                role: "employee",
                department: "Product",
                authProvider: "credentials"
            }
        ];

        const createdUsers = await UserModel.insertMany(users, { ordered: false });

        // Update employee's manager to the manager user
        const managerUser = createdUsers.find(u => u.role === "manager");
        const employees = createdUsers.filter(u => u.role === "employee");

        if (managerUser) {
            await UserModel.updateMany(
                { _id: { $in: employees.map(e => e._id) } },
                { managerId: managerUser._id }
            );
        }

        // Create cycles
        const now = new Date();
        const cycles = [
            {
                name: "FY2026 Goal Setting",
                phase: "goal_setting",
                openDate: new Date(now.getFullYear(), 0, 1),
                closeDate: new Date(now.getFullYear(), 0, 31),
                isActive: true
            },
            {
                name: "FY2026 Q1",
                phase: "q1",
                openDate: new Date(now.getFullYear(), 1, 1),
                closeDate: new Date(now.getFullYear(), 3, 30),
                isActive: false
            },
            {
                name: "FY2026 Q2",
                phase: "q2",
                openDate: new Date(now.getFullYear(), 4, 1),
                closeDate: new Date(now.getFullYear(), 6, 30),
                isActive: false
            },
            {
                name: "FY2026 Q3",
                phase: "q3",
                openDate: new Date(now.getFullYear(), 7, 1),
                closeDate: new Date(now.getFullYear(), 9, 30),
                isActive: false
            }
        ];

        await Cycle.insertMany(cycles, { ordered: false });

        return Response.json({
            success: true,
            message: "Database seeded successfully",
            data: {
                usersCreated: createdUsers.length,
                cyclesCreated: cycles.length,
                testCredentials: {
                    admin: { email: "admin@test.com", password: "password123" },
                    manager: { email: "manager@test.com", password: "password123" },
                    employee1: { email: "emp1@test.com", password: "password123" },
                    employee2: { email: "emp2@test.com", password: "password123" }
                }
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("SEED_ERROR:", error);
        return Response.json({
            success: false,
            message: error.message || "An error occurred while seeding database"
        }, { status: 500 });
    }
}
