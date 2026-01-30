
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

dbConnect();

export async function GET() {
    try {
        const limit = 10;

        const trendingNotes = await Note.find({ isPublished: true })
            .sort({ views: -1 })
            .limit(limit)
            .populate('subCategoryId', 'name slug')
            .populate('authorId', 'name image');

        const trendingCategories = await Category.find({})
            .sort({ views: -1 })
            .limit(limit);

        const trendingSubCategories = await SubCategory.find({})
            .sort({ views: -1 })
            .limit(limit)
            .populate('categoryId', 'name slug');

        return NextResponse.json({
            notes: trendingNotes,
            categories: trendingCategories,
            subCategories: trendingSubCategories
        });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
