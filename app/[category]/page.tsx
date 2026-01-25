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
                    <Link key={sub._id} href={`/${category.slug}/${sub.slug}`} className="group p-6 border rounded-xl bg-card hover:shadow-lg transition-all hover:border-primary/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Folder className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{sub.name}</h3>
                                <p className="text-sm text-muted-foreground">View Topics</p>
                            </div>
                        </div>
                    </Link>
                ))}
                {subCategories.length === 0 && (
                    <p className="text-muted-foreground">No sub-categories found.</p>
                )}
            </div>
        </div>
    );
}
