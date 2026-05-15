import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';
import { revalidatePath } from 'next/cache';

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || !['owner', 'co_owner'].includes(payload.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if Co-owner has access
        if (payload.role === 'co_owner') {
            const User = (await import('@/models/User')).default;
            const user = await User.findById(payload.userId);
            const { hasCategoryAccess } = await import('@/lib/utils');
            if (!user || !hasCategoryAccess(user, params.id)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const category = await Category.findByIdAndDelete(params.id);

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Edge Case 1: Cleanup assignedCategories in all users
        const User = (await import('@/models/User')).default;
        await User.updateMany(
            { assignedCategories: params.id },
            { $pull: { assignedCategories: params.id } }
        );

        // Log activity
        const { createAuditLog } = await import('@/lib/audit');
        await createAuditLog(payload.userId as string, {
            action: 'delete_category',
            details: `User deleted category: ${category.name}`,
            targetId: category._id as string,
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

        if (!payload || !['owner', 'co_owner'].includes(payload.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if Co-owner has access
        if (payload.role === 'co_owner') {
            const User = (await import('@/models/User')).default;
            const user = await User.findById(payload.userId);
            const { hasCategoryAccess } = await import('@/lib/utils');
            if (!user || !hasCategoryAccess(user, params.id)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const body = await req.json();
        await dbConnect();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Log activity
        const { createAuditLog } = await import('@/lib/audit');
        await createAuditLog(payload.userId as string, {
            action: 'update_category',
            details: `User updated category: ${category.name}`,
            targetId: category._id as string,
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ category });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Category name, slug, or rank already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
