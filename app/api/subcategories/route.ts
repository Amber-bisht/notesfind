import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubCategory from '@/models/SubCategory';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    try {
        const query = categoryId ? { categoryId } : {};
        const subCategories = await SubCategory.find(query).populate('categoryId', 'name slug').sort({ createdAt: -1 });
        return NextResponse.json({ subCategories });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sub-categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();
        const subCategory = await SubCategory.create(body);

        return NextResponse.json({ subCategory }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'SubCategory slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
