import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/option";
import dbConnect from "@/src/lib/dbConnect";
import { Cycle } from "@/src/models/Cycle";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "admin") {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const cycles = await Cycle.find().sort({ createdAt: -1 });

        return Response.json({
            success: true,
            data: cycles
        }, { status: 200 });

    } catch (error) {
        console.error("CYCLES_GET_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while fetching cycles"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "admin") {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const body = await request.json();
        const { name, phase, openDate, closeDate, isActive } = body;

        if (!name || !phase || !openDate || !closeDate) {
            return Response.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }

        // If making this cycle active, deactivate others
        if (isActive) {
            await Cycle.updateMany({}, { isActive: false });
        }

        const cycle = await Cycle.create({
            name,
            phase,
            openDate: new Date(openDate),
            closeDate: new Date(closeDate),
            isActive: isActive || false
        });

        return Response.json({
            success: true,
            message: "Cycle created successfully",
            data: cycle
        }, { status: 201 });

    } catch (error) {
        console.error("CYCLES_POST_ERROR:", error);
        return Response.json({
            success: false,
            message: "An error occurred while creating cycle"
        }, { status: 500 });
    }
}
