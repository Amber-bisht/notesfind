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

        if (!payload || payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const category = await Category.findByIdAndDelete(params.id);

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

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

        if (!payload || payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ category });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json({ error: 'Category name, slug, or rank already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
}
