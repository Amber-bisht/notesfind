import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import { Folder } from 'lucide-react';

interface Params {
    params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
    try {
        await dbConnect();
        const categories = await Category.find({}, 'slug').lean();
        return categories.map((c: any) => ({
            category: c.slug,
        }));
    } catch (e) {
        console.warn('DB connection failed during SSG for categories, skipping static generation');
        return [];
    }
}

export async function generateMetadata(props: Params) {
    const params = await props.params;
    await dbConnect();
    const category = await Category.findOne({ slug: params.category }).lean() as any;
    if (!category) return { title: 'Not Found' };

    return {
        title: `${category.name} Notes - NotesFind`,
        description: category.description || `Browse ${category.name} notes and tutorials.`,
    };
}

export default async function CategoryPage(props: Params) {
    const params = await props.params;
    await dbConnect();

    const category = await Category.findOne({ slug: params.category }).lean() as any;
    if (!category) return notFound();

    const subCategories = await SubCategory.find({ categoryId: category._id }).sort({ name: 1 }).lean();

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
                <p className="text-xl text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subCategories.map((sub: any) => (
                    <Link key={sub._id} href={`/${category.slug}/${sub.slug}`} className="group rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 block overflow-hidden h-full flex flex-col">
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            {sub.image ? (
                                <img
                                    src={sub.image}
                                    alt={sub.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                    <Folder className="h-10 w-10 text-primary/40" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-xl font-bold mb-2">{sub.name}</h3>
                            <p className="text-muted-foreground line-clamp-2 text-sm flex-1">
                                {sub.description || "Browse topics and tutorials."}
                            </p>
                            <div className="pt-4 mt-auto">
                                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Explore</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {subCategories.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center py-12">No sub-categories found.</p>
                )}
            </div>
        </div>
    );
}
