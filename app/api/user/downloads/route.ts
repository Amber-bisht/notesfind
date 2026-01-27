import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const session = await verifyToken(token);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { noteId, slug } = body;

        if (!noteId || !slug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const alreadyDownloaded = user.downloads.some((d: any) => d.noteId.toString() === noteId);

        if (!alreadyDownloaded) {
            user.downloads.push({ noteId, slug, downloadedAt: new Date() });
            await user.save();
        }

        return NextResponse.json({ message: "Download tracked" });

    } catch (error) {
        console.error("Track download error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
