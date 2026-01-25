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
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();
        const category = await Category.create(body);

        return NextResponse.json({ category }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Category name, slug, or rank already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
