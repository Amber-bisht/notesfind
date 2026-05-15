import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SubCategory from "@/models/SubCategory";
import Note from "@/models/Note";
import mongoose from "mongoose";

export async function GET() {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "This route is only available in development mode" }, { status: 403 });
    }

    try {
        await dbConnect();

        // Ensure models are registered

        const subCategories = await SubCategory.find({});
        if (!subCategories || subCategories.length === 0) {
            return NextResponse.json({ message: "No subcategories found to seed notes for." });
        }

        const validImage = "https://res.cloudinary.com/dfgue9odu/image/upload/v1769352922/l5xus9gaszcuc5qypvus.webp";
        // strict author ID as requested
        const authorId = new mongoose.Types.ObjectId("69762da94254d967b6d0cd02");

        const createdNotes = [];
        let skippedCount = 0;

        for (const sub of subCategories) {
            const baseSlug = sub.slug;

            // Generate 5 fake notes
            for (let i = 1; i <= 5; i++) {
                const noteTitle = `${sub.name} detailed note ${i}`;
                const noteSlug = `${baseSlug}-note-${i}`;

                const existing = await Note.findOne({ slug: noteSlug });
                if (existing) {
                    skippedCount++;
                    continue;
                }

                // Calculate next rank
                // We do this inside the loop properly because checks happen sequentially
                const highestRankNote = await Note.findOne({ subCategoryId: sub._id }).sort({ rank: -1 });
                const nextRank = highestRankNote ? (highestRankNote.rank || 0) + 1 : 1;

                const newNote = await Note.create({
                    title: noteTitle,
                    slug: noteSlug,
                    content: `
                        <h2>Introduction</h2>
                        <p>This is a fake note content for <strong>${sub.name}</strong>, note number ${i}.</p>
                        <p>It contains some placeholder text to demonstrate the layout.</p>
                        <h3>Key Concepts</h3>
                        <ul>
                            <li>Concept 1: Important detail about ${sub.name}</li>
                            <li>Concept 2: Another crucial point</li>
                            <li>Concept 3: Summary of topic</li>
                        </ul>
                        <p>End of fake content.</p>
                    `,
                    subCategoryId: sub._id,
                    authorId: authorId,
                    images: [validImage],
                    isPublished: true,
                    rank: nextRank
                });
                createdNotes.push(newNote);
            }
        }

        return NextResponse.json({
            message: "Note seeding complete",
            subCategoriesProcessed: subCategories.length,
            notesAdded: createdNotes.length,
            notesSkipped: skippedCount,
            // details: createdNotes.map(n => ({ title: n.title, subCategory: n.subCategoryId })) // Too large for response maybe
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: "Failed to seed notes", details: (error as Error).message }, { status: 500 });
    }
}
