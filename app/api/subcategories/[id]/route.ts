import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubCategory from '@/models/SubCategory';
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
        const subCategory = await SubCategory.findByIdAndDelete(params.id);

        if (!subCategory) {
            return NextResponse.json({ error: 'SubCategory not found' }, { status: 404 });
        }

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

        if (!payload || payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();
        const subCategory = await SubCategory.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        if (!subCategory) {
            return NextResponse.json({ error: 'SubCategory not found' }, { status: 404 });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ subCategory });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'SubCategory slug or rank already exists in this category' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
