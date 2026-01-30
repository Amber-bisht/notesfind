import Link from 'next/link';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Note from '@/models/Note';
import SubCategory from '@/models/SubCategory'; // Ensure model is registered
import { ArrowRight, BookOpen, Clock, ChevronRight, Instagram } from 'lucide-react';
import { RequestResourceForm } from '@/components/RequestResourceForm';
import communityData from '@/data/community-links.json';

async function getData() {
    await dbConnect();
    // Ensure SubCategory model is registered for the lookup to work nicely if using populate,
    // though for aggregate we use collection name 'subcategories'
    // but good practice to have the model loaded.
    await SubCategory.init();

    try {
        const [categories, notes, noteCounts, subCategories] = await Promise.all([
            Category.find({}).sort({ createdAt: -1 }).lean(),
            Note.find({ isPublished: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('subCategoryId')
                .populate('authorId', 'name image')
                .lean(),
            Note.aggregate([
                { $match: { isPublished: true } },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subCategoryId',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                { $unwind: '$subcategory' },
                {
                    $group: {
                        _id: '$subcategory.categoryId',
                        count: { $sum: 1 }
                    }
                }
            ]),
            SubCategory.find({}).sort({ createdAt: -1 }).limit(5).populate('categoryId', 'name slug').lean()
        ]);

        const categoriesWithCounts = categories.map((cat: any) => {
            const countObj = noteCounts.find((c: any) => c._id.toString() === cat._id.toString());
            return {
                ...cat,
                count: countObj ? countObj.count : 0
            };
        });

        // Sort categories by count (descending)
        categoriesWithCounts.sort((a: any, b: any) => b.count - a.count);

        // Filter out subcategories with missing categories (e.g. deleted parents)
        const validSubCategories = subCategories.filter((sub: any) => sub.categoryId);

        return {
            categories: JSON.parse(JSON.stringify(categoriesWithCounts)),
            notes: JSON.parse(JSON.stringify(notes)),
            subCategories: JSON.parse(JSON.stringify(validSubCategories))
        };
    } catch (error) {
        console.error("Home page data fetch error:", error);
        return { categories: [], notes: [] };
    }
}

export default async function Home() {
    const { categories, notes, subCategories } = await getData();
    const featuredNote = notes[0];
    const latestNotes = notes.slice(1);

    return (
        <div className="flex flex-col gap-12 pb-20">
            {/* Hero Section / Featured Article */}
            {featuredNote && (
                <section className="relative w-full aspect-[21/9] md:aspect-[3/1] min-h-[400px] overflow-hidden group">
                    <img
                        src={featuredNote.images?.[0] || "/placeholder-hero.jpg"}
                        alt={featuredNote.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-4xl">
                        <div className="flex items-center gap-3 text-white/80 mb-3 text-sm font-medium tracking-wide">
                            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs uppercase font-bold">Featured</span>
                            <span>{new Date(featuredNote.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                            {featuredNote.title}
                        </h1>
                        <p className="text-white/80 line-clamp-2 md:text-lg max-w-2xl mb-6">
                            {featuredNote.content.substring(0, 150)}...
                        </p>
                        <Link
                            href={`/blog/${featuredNote.slug}`}
                            className="inline-flex items-center gap-2 text-white font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors"
                        >
                            Read Article <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            )}

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content - Latest Articles */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-bold tracking-tight uppercase">Latest Articles</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {latestNotes.length > 0 ? (
                                latestNotes.map((note: any) => (
                                    <div key={note._id} className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                        <div className="md:col-span-5 aspect-video md:aspect-[4/3] relative rounded-xl overflow-hidden bg-muted">
                                            {note.images?.[0] ? (
                                                <img
                                                    src={note.images[0]}
                                                    alt={note.title}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                                    <BookOpen className="w-10 h-10 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-7 flex flex-col h-full space-y-3">
                                            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                {note.subCategoryId?.categoryId?.name && (
                                                    <span className="text-primary">{note.subCategoryId.categoryId.name}</span>
                                                )}
                                                <span>•</span>
                                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                                                <Link href={`/blog/${note.slug}`}>
                                                    {note.title}
                                                </Link>
                                            </h3>
                                            <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 flex-1 text-sm md:text-base">
                                                {note.content}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm font-medium pt-2">
                                                <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                                                    {note.authorId?.image ? (
                                                        <img src={note.authorId.image} alt={note.authorId.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                                                            {note.authorId?.name?.[0] || 'A'}
                                                        </div>
                                                    )}
                                                </div>
                                                <span>{note.authorId?.name || 'Admin'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                                    <p className="text-muted-foreground">No updates yet. Stay tuned!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-12">

                        {/* Tags / Categories Widget */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Discover</span>
                                <h3 className="font-bold text-lg">Tags</h3>
                            </div>

                            {categories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category: any) => (
                                        <Link
                                            key={category._id}
                                            href={`/${category.slug}`}
                                            className="px-4 py-2 bg-background border rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                                        >
                                            {category.name} <span className="opacity-50 ml-1 text-xs">({category.count})</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No tags available.</p>
                            )}
                        </div>

                        {/* Subcategories Widget (Replaced Trending) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Explore</span>
                                <h3 className="font-bold text-lg">Subcategories</h3>
                            </div>
                            <div className="space-y-4">
                                {subCategories && subCategories.length > 0 ? (
                                    subCategories.map((sub: any, i: number) => (
                                        <Link key={sub._id} href={`/${sub.categoryId?.slug}/${sub.slug}`} className="flex gap-4 group cursor-pointer items-center">
                                            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-primary/40">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1 uppercase tracking-wide">
                                                    {sub.categoryId?.name}
                                                </div>
                                                <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {sub.name}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No subcategories found.</p>
                                )}
                            </div>
                        </div>

                        {/* Newsletter Widget */}
                        <div className="bg-primary text-primary-foreground p-8 rounded-2xl text-center space-y-4">
                            <div className="flex justify-center">
                                <Instagram className="w-12 h-12" />
                            </div>
                            <h3 className="font-black text-2xl">Weekly Updates</h3>
                            <p className="text-primary-foreground/80 text-sm">Join 10,000+ developers getting the best notes delivered.</p>

                            <a
                                href={communityData.find(c => c.platform === 'Instagram')?.links[0]?.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-black text-white rounded-lg font-bold uppercase tracking-wide hover:bg-black/80 transition-opacity"
                            >
                                Connect with us on Instagram
                            </a>
                        </div>

                    </aside>

                </div>
            </div>

            {/* Restored Categories Grid Section */}
            <section id="categories" className="py-12 bg-muted/30 border-y">
                <div className="container mx-auto px-4 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black tracking-tight uppercase">Explore Topics</h2>
                        <Link href="/categories" className="hidden md:inline-flex items-center text-sm font-bold text-primary hover:underline">
                            View All Categories <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.slice(0, 4).map((category: any) => (
                            <Link key={category._id} href={`/${category.slug}`} className="group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
                                <div className="aspect-[3/2] bg-muted relative overflow-hidden">
                                    {category.image ? (
                                        <img src={category.image} alt={category.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-primary/10 text-primary/40"><BookOpen className="w-8 h-8" /></div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                        {category.name}
                                        <span className="ml-2 text-sm text-muted-foreground font-normal">({category.count} notes)</span>
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="md:hidden text-center mt-6">
                        <Link href="/categories" className="inline-flex items-center justify-center w-full py-3 border rounded-lg font-bold">
                            View All Categories
                        </Link>
                    </div>
                </div>
            </section>
            {/* Request Resources Section */}
            <section className="container mx-auto px-4 pb-12">
                <RequestResourceForm />
            </section>
        </div>
    );
}
