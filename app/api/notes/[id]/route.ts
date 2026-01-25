import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await dbConnect();
    try {
        const note = await Note.findById(params.id).populate('authorId', 'name image').populate('subCategoryId');
        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json({ note });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const note = await Note.findById(params.id);

        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // Check permissions: Admin can delete any, Publisher can only delete own
        if (payload.role !== UserRole.ADMIN && (payload.role !== UserRole.PUBLISHER || note.authorId.toString() !== payload.userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await note.deleteOne();

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const note = await Note.findById(params.id);

        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // Check permissions
        if (payload.role !== UserRole.ADMIN && (payload.role !== UserRole.PUBLISHER || note.authorId.toString() !== payload.userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        // Prevent changing authorId
        delete body.authorId;

        const updatedNote = await Note.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        revalidatePath('/', 'layout');
        return NextResponse.json({ note: updatedNote });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Note slug or rank already exists in this sub-category' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
