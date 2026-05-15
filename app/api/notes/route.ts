import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const subCategoryId = searchParams.get('subCategoryId');
    const authorId = searchParams.get('authorId');

    try {
        const query: { subCategoryId?: string; authorId?: string } = {};
        if (subCategoryId) query.subCategoryId = subCategoryId;
        if (authorId) query.authorId = authorId;

        const notes = await Note.find(query)
            .populate('authorId', 'name image')
            .populate({
                path: 'subCategoryId',
                populate: { path: 'categoryId', select: 'slug name' }
            })
            .sort({ createdAt: -1 });
        return NextResponse.json({ notes });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

import { revalidatePath } from 'next/cache';

// ... (GET handler same)

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Roles check
        if (!['owner', 'co_owner', 'publisher'].includes(payload.role as string)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { subCategoryId } = body;

        if (!subCategoryId) {
            return NextResponse.json({ error: 'Sub-category is required' }, { status: 400 });
        }

        await dbConnect();

        // Check category access for Co-owners and Publishers
        if (payload.role !== 'owner') {
            const SubCategory = (await import('@/models/SubCategory')).default;
            const subCat = await SubCategory.findById(subCategoryId);
            if (!subCat) {
                return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 });
            }

            const User = (await import('@/models/User')).default;
            const user = await User.findById(payload.userId);
            
            const { hasCategoryAccess } = await import('@/lib/utils');
            if (!user || !hasCategoryAccess(user, subCat.categoryId)) {
                return NextResponse.json({ error: 'You do not have access to this category' }, { status: 403 });
            }
        }

        // Assign authorId from token
        body.authorId = payload.userId;

        const note = await Note.create(body);

        // Log activity
        const { createAuditLog } = await import('@/lib/audit');
        await createAuditLog(payload.userId as string, {
            action: 'publish_note',
            details: `User published note: ${note.title}`,
            targetId: note._id.toString(),
            metadata: { slug: note.slug }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ note }, { status: 201 });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Note slug or rank already exists in this sub-category' }, { status: 400 });
        }
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
