
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import User from "@/models/User";
import { getDataFromToken } from "@/helpers/getDataFromToken";

dbConnect();

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();
        const { noteId } = reqBody;

        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const note = await Note.findById(noteId);
        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        // Check if already liked
        const isLiked = note.likes.some((id) => id.toString() === userId);
        let action = "";

        if (isLiked) {
            // Unlike
            await Note.findByIdAndUpdate(noteId, { $pull: { likes: userId } });
            await User.findByIdAndUpdate(userId, { $pull: { likedNotes: noteId } });
            action = "unliked";
        } else {
            // Like
            await Note.findByIdAndUpdate(noteId, { $addToSet: { likes: userId } });
            await User.findByIdAndUpdate(userId, { $addToSet: { likedNotes: noteId } });
            action = "liked";
        }

        const updatedNote = await Note.findById(noteId);

        if (!updatedNote) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: `Note ${action} successfully`,
            likesCount: updatedNote.likes.length,
            isLiked: !isLiked
        });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
