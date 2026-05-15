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
    } catch {
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

        // Check permissions: Owner can delete any. Co-owner/Publisher only in their categories.
        if (payload.role !== 'owner') {
            const User = (await import('@/models/User')).default;
            const user = await User.findById(payload.userId);
            const subCat = await (await import('@/models/SubCategory')).default.findById(note.subCategoryId);
            const { hasCategoryAccess } = await import('@/lib/utils');

            if (!user || !subCat || !hasCategoryAccess(user, subCat.categoryId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        await note.deleteOne();

        // Log activity
        const { createAuditLog } = await import('@/lib/audit');
        await createAuditLog(payload.userId as string, {
            action: 'delete_note',
            details: `User deleted note: ${note.title}`,
            targetId: note._id as string,
            metadata: { slug: note.slug }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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
        if (payload.role !== 'owner') {
            const User = (await import('@/models/User')).default;
            const user = await User.findById(payload.userId);
            const subCat = await (await import('@/models/SubCategory')).default.findById(note.subCategoryId);
            const { hasCategoryAccess } = await import('@/lib/utils');

            if (!user || !subCat || !hasCategoryAccess(user, subCat.categoryId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const body = await req.json();

        // If subCategoryId is being changed, check access to new category too
        if (body.subCategoryId && body.subCategoryId !== note.subCategoryId.toString()) {
            const newSubCat = await (await import('@/models/SubCategory')).default.findById(body.subCategoryId);
            const User = (await import('@/models/User')).default;
            const user = await User.findById(payload.userId);
            const { hasCategoryAccess } = await import('@/lib/utils');
            
            if (!newSubCat || !user || !hasCategoryAccess(user, newSubCat.categoryId)) {
                return NextResponse.json({ error: 'Forbidden: No access to target category' }, { status: 403 });
            }
        }

        // Prevent changing authorId
        delete body.authorId;

        const updatedNote = await Note.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        // Log activity
        const { createAuditLog } = await import('@/lib/audit');
        await createAuditLog(payload.userId as string, {
            action: 'update_note',
            details: `User updated note: ${updatedNote?.title}`,
            targetId: updatedNote?._id as string,
            metadata: { slug: updatedNote?.slug }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ note: updatedNote });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Note slug or rank already exists in this sub-category' }, { status: 400 });
        }
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
