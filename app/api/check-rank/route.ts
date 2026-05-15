import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Note from '@/models/Note';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const rank = searchParams.get('rank');
    const scopeId = searchParams.get('scopeId');
    const excludeId = searchParams.get('excludeId'); // for edit mode, exclude current doc

    if (!type || !rank) {
        return NextResponse.json({ error: 'Missing type or rank' }, { status: 400 });
    }

    try {
        let count = 0;
        const query: { rank: number; _id?: { $ne: string }; categoryId?: string; subCategoryId?: string } = { rank: parseInt(rank) };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        if (type === 'category') {
            count = await Category.countDocuments(query);
        } else if (type === 'subcategory') {
            if (!scopeId) return NextResponse.json({ error: 'Missing scopeId for subcategory' }, { status: 400 });
            query.categoryId = scopeId;
            count = await SubCategory.countDocuments(query);
        } else if (type === 'note') {
            if (!scopeId) return NextResponse.json({ error: 'Missing scopeId for note' }, { status: 400 });
            query.subCategoryId = scopeId;
            count = await Note.countDocuments(query);
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        return NextResponse.json({ available: count === 0 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
