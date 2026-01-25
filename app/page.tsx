import Link from 'next/link';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { ArrowRight, BookOpen } from 'lucide-react';

async function getCategories() {
    await dbConnect();
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(categories)); // Serialization for server component
    } catch (error) {
        return [];
    }
}

export default async function Home() {
    const categories = await getCategories();

    return (
        <div className="flex flex-col gap-12">
            {/* Hero Section */}
            <section className="py-20 text-center space-y-6">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
                    Master Your Tech Skills
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                    Premium notes for AI, Machine Learning, Data Structures, and Algorithms. Curated for clarity and depth.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    {/* CTA */}
                    <Link href="#categories" className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
                        Browse Notes
                    </Link>
                    <Link href="/auth" className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8">
                        Start Writing
                    </Link>
                </div>
            </section>

            {/* Ad Placeholder */}
            <div className="w-full h-32 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed">
                <span className="text-muted-foreground text-sm">Advertisement Space</span>
            </div>

            {/* Categories Grid */}
            <section id="categories" className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Explore Categories</h2>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No categories found. Admin needs to add some.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category: any) => (
                            <Link key={category._id} href={`/${category.slug}`} className="group relative rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 block overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <div className="p-3 bg-primary/10 w-fit rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{category.name}</h3>
                                    <p className="text-muted-foreground line-clamp-2">
                                        {category.description || `Explore the best notes in ${category.name}.`}
                                    </p>
                                    <div className="flex items-center text-primary font-medium pt-2">
                                        View Notes <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
