import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";

export async function GET() {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "This route is only available in development mode" }, { status: 403 });
    }

    try {
        await dbConnect();

        // Ensure models are registered (Category imported above does this, SubCategory too)

        const categories = await Category.find({});
        if (!categories || categories.length === 0) {
            return NextResponse.json({ message: "No categories found to seed subcategories for." });
        }

        const validImage = "https://res.cloudinary.com/dfgue9odu/image/upload/v1769352922/l5xus9gaszcuc5qypvus.webp";
        const createdSubCategories = [];
        let skippedCount = 0;

        for (const category of categories) {
            const baseSlug = category.slug;

            // Find current max rank for this category to avoid collision
            const highestRankSub = await SubCategory.findOne({ categoryId: category._id }).sort({ rank: -1 });
            let nextRank = highestRankSub ? highestRankSub.rank + 1 : 1;

            // Subcategory 1: Fundamentals
            const sub1Name = `${category.name} Fundamentals`;
            const sub1Slug = `${baseSlug}-fundamentals`;

            // Check existence logic can remain, but maybe slug existence is enough check?
            // If slug exists, we skip.
            const existing1 = await SubCategory.findOne({ slug: sub1Slug });
            if (!existing1) {
                const sub1 = await SubCategory.create({
                    name: sub1Name,
                    slug: sub1Slug,
                    description: `Core concepts and basics of ${category.name}.`,
                    image: validImage,
                    rank: nextRank,
                    categoryId: category._id
                });
                createdSubCategories.push(sub1);
                nextRank++;
            } else {
                skippedCount++;
            }

            // Subcategory 2: Advanced
            const sub2Name = `${category.name} Advanced`;
            const sub2Slug = `${baseSlug}-advanced`;

            const existing2 = await SubCategory.findOne({ slug: sub2Slug });
            if (!existing2) {
                const sub2 = await SubCategory.create({
                    name: sub2Name,
                    slug: sub2Slug,
                    description: `Advanced topics and deep dives into ${category.name}.`,
                    image: validImage,
                    rank: nextRank,
                    categoryId: category._id
                });
                createdSubCategories.push(sub2);
                nextRank++;
            } else {
                skippedCount++;
            }
        }

        return NextResponse.json({
            message: "Subcategory seeding complete",
            categoriesProcessed: categories.length,
            subCategoriesAdded: createdSubCategories.length,
            subCategoriesSkipped: skippedCount,
            details: createdSubCategories.map(s => ({ name: s.name, category: s.categoryId }))
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: "Failed to seed subcategories", details: (error as Error).message }, { status: 500 });
    }
}
