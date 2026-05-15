import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET() {
    await dbConnect();
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ categories });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

import { revalidatePath } from 'next/cache';

// ... (GET handler remains same)

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || !['owner', 'co_owner'].includes(payload.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();
        const category = await Category.create(body);

        // If Co-owner created it, assign it to them automatically
        if (payload.role === 'co_owner') {
            const User = (await import('@/models/User')).default;
            await User.findByIdAndUpdate(payload.userId, {
                $addToSet: { assignedCategories: category._id }
            });
        }

        // Log activity
        const { createAuditLog } = await import('@/lib/audit');
        await createAuditLog(payload.userId as string, {
            action: 'create_category',
            details: `User created category: ${category.name}`,
            targetId: category._id.toString(),
        });

        revalidatePath('/', 'layout'); // Purge cache
        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Category name, slug, or rank already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
