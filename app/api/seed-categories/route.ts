import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "This route is only available in development mode" }, { status: 403 });
    }

    try {
        await dbConnect();

        const providedImage = "https://res.cloudinary.com/dfgue9odu/image/upload/v1769352922/l5xus9gaszcuc5qypvus.webp";

        // Update ALL existing categories to use this valid image first
        // This ensures the 404s are fixed for any category already in the DB
        const updateResult = await Category.updateMany({}, { image: providedImage });

        const categoriesToSeed = [
            { name: "Programming", slug: "programming", description: "Learn the basics of coding and development." },
            { name: "Cyber Security", slug: "cyber-security", description: "Protect systems and networks from digital attacks." },
            { name: "Data Structures", slug: "dsa", description: "Master the fundamental building blocks of software." },
            { name: "Machine Learning", slug: "machine-learning", description: "Teach computers to learn from data." },
            { name: "Web Development", slug: "web-development", description: "Build modern websites and web applications." },
            { name: "System Design", slug: "system-design", description: "Learn to design scalable and reliable systems." },
            { name: "Cloud Computing", slug: "cloud-computing", description: "Deploy and scale applications in the cloud." },
            { name: "DevOps", slug: "devops", description: "Streamline development and operations." },
            { name: "Blockchain", slug: "blockchain", description: "Decentralized technologies and cryptocurrencies." },
            { name: "Artificial Intelligence", slug: "ai", description: "Create intelligent systems and agents." },
            { name: "Mobile Development", slug: "mobile-dev", description: "Build apps for iOS and Android devices." },
        ];

        let maxRank = 0;
        const highestRankCategory = await Category.findOne().sort({ rank: -1 });
        if (highestRankCategory) {
            maxRank = highestRankCategory.rank;
        }

        const createdCategories = [];

        for (let i = 0; i < categoriesToSeed.length; i++) {
            const cat = categoriesToSeed[i];

            // Check if exists
            const existing = await Category.findOne({ slug: cat.slug });
            if (existing) {
                // Since existing ones are already updated by updateMany, we don't need to do anything here
                continue;
            }

            const newCategory = await Category.create({
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                image: providedImage,
                rank: maxRank + i + 1,
            });
            createdCategories.push(newCategory);
        }

        return NextResponse.json({
            message: "Seeding complete and images fixed",
            updatedExisting: updateResult.modifiedCount,
            added: createdCategories.length,
            categories: createdCategories
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: "Failed to seed categories", details: (error as Error).message }, { status: 500 });
    }
}
