
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { bufferView } from "@/lib/view-buffer";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { id } = reqBody;

        if (!id) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        // 1. SPAM PROTECTION: Same browser check
        const cookieName = `v_${id}`;
        const hasViewed = request.cookies.get(cookieName);

        if (hasViewed) {
            // Already viewed in this session, don't even buffer
            return NextResponse.json({ message: "Already counted" });
        }

        // 2. BUFFER VIEW: Instead of writing to DB now, we add it to memory.
        // This is ultra-fast and handles 100k+ users easily.
        bufferView(id);

        // 3. SET COOKIE & RESPOND
        const response = NextResponse.json({
            message: "View buffered successfully"
        });

        response.cookies.set(cookieName, '1', {
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
            httpOnly: true,
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
