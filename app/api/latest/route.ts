
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

dbConnect();

export async function GET() {
    try {
        const limit = 10;

        const latestNotes = await Note.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('subCategoryId', 'name slug')
            .populate('authorId', 'name image');

        const latestCategories = await Category.find({})
            .sort({ createdAt: -1 })
            .limit(limit);

        const latestSubCategories = await SubCategory.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('categoryId', 'name slug');

        return NextResponse.json({
            notes: latestNotes,
            categories: latestCategories,
            subCategories: latestSubCategories
        });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
