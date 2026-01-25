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
            <section className="py-12 md:py-24 lg:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text */}
                    <div className="text-left space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                                MASTER YOUR<br />
                                TECH SKILLS
                            </h1>
                            <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-lg">
                                become a top 1% developer without burning out.
                                <br />
                                enjoy premium notes for free.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="#categories" className="inline-flex items-center justify-center rounded-lg border-2 border-primary bg-background px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">
                                Browse Notes
                            </Link>
                            <Link href="/auth" className="inline-flex items-center justify-center rounded-lg border-2 border-input bg-background px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all">
                                Start Writing
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] flex items-center justify-center">
                        {/* Light Mode Image */}
                        <img
                            src="/lighttheme.png"
                            alt="NotesFind Dashboard Light"
                            className="w-full h-auto object-contain dark:hidden max-h-[500px]"
                        />
                        {/* Dark Mode Image */}
                        <img
                            src="/darktheme.png"
                            alt="NotesFind Dashboard Dark"
                            className="w-full h-auto object-contain hidden dark:block max-h-[500px]"
                        />
                    </div>
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
                            <Link key={category._id} href={`/${category.slug}`} className="group relative rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 block overflow-hidden h-full flex flex-col">
                                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                            <BookOpen className="h-10 w-10 text-primary/40" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                                    <p className="text-muted-foreground line-clamp-2 flex-1">
                                        {category.description || `Explore the best notes in ${category.name}.`}
                                    </p>
                                    <div className="flex items-center text-primary font-medium pt-4 mt-auto">
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
