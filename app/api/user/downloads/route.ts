import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

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

        const alreadyDownloaded = user.downloads.some((d: { noteId: { toString: () => string } }) => d.noteId.toString() === noteId);

        if (!alreadyDownloaded) {
            user.downloads.push({ noteId, slug, downloadedAt: new Date() });
            await user.save();

            await createAuditLog(
                user._id,
                "note_download",
                `User downloaded note: ${slug}`,
                noteId,
                { slug }
            );
        }

        return NextResponse.json({ message: "Download tracked" });

    } catch (error) {
        console.error("Track download error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
