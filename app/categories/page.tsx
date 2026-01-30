import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { BookOpen, ArrowRight } from 'lucide-react';

async function getCategories() {
    await dbConnect();
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Explore Categories</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Browse our comprehensive collection of notes organized by topic.
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No categories found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category: { _id: string; slug: string; image?: string; name: string; description?: string }) => (
                        <Link key={category._id} href={`/${category.slug}`} className="group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 block overflow-hidden h-full flex flex-col">
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                {category.image ? (
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        width={400}
                                        height={225}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                        <BookOpen className="h-10 w-10 text-primary/40" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{category.name}</h3>
                                <p className="text-muted-foreground line-clamp-2 flex-1 mb-6">
                                    {category.description || `Explore the best notes in ${category.name}.`}
                                </p>
                                <div className="flex items-center text-sm font-bold text-primary uppercase tracking-wider mt-auto">
                                    Browse Notes <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
