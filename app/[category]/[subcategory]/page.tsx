import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Note from '@/models/Note';
import { FileText } from 'lucide-react';

interface Params {
    params: Promise<{ category: string; subcategory: string }>;
}

export async function generateStaticParams() {
    try {
        await dbConnect();
        // We need to fetch all subcategories and their parent category slug
        // Mongoose populate is easiest
        const subCategories = await SubCategory.find({}).populate('categoryId', 'slug').lean();

        return subCategories
            .filter((sub: any) => sub.categoryId) // Ensure parent exists
            .map((sub: any) => ({
                category: sub.categoryId.slug,
                subcategory: sub.slug,
            }));
    } catch (e) {
        console.warn('DB connection failed during SSG for subcategories, skipping static generation');
        return [];
    }
}

export async function generateMetadata(props: Params) {
    const params = await props.params;
    await dbConnect();
    const subCategory = await SubCategory.findOne({ slug: params.subcategory }).lean() as any;
    if (!subCategory) return { title: 'Not Found' };

    return {
        title: `${subCategory.name} Notes - NotesFind`,
        description: `Best notes for ${subCategory.name}`,
    };
}

export default async function SubCategoryPage(props: Params) {
    const params = await props.params;
    await dbConnect();

    // Verify category exists too for correct URL structure
    const category = await Category.findOne({ slug: params.category }).select('_id slug name').lean();
    if (!category) return notFound();

    const subCategory = await SubCategory.findOne({ slug: params.subcategory, categoryId: category._id }).lean() as any;
    if (!subCategory) return notFound();

    const notes = await Note.find({ subCategoryId: subCategory._id, isPublished: true }).sort({ createdAt: -1 }).populate('authorId', 'name image').lean();

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <Link href={`/${params.category}`} className="hover:text-primary transition-colors">{category.name}</Link>
                    <span>/</span>
                    <span className="text-foreground">{subCategory.name}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{subCategory.name} Notes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note: any) => (
                    <Link key={note._id} href={`/${params.category}/${params.subcategory}/${note.slug}`} className="group rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 block overflow-hidden h-full flex flex-col">
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            {note.images?.[0] ? (
                                <img
                                    src={note.images[0]}
                                    alt={note.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                    <FileText className="h-10 w-10 text-primary/40" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-1 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{note.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mt-2">{note.content}</p>
                            </div>
                            <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    {note.authorId?.image ?
                                        <img src={note.authorId.image} className="w-6 h-6 rounded-full" alt={note.authorId.name} /> :
                                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                                    }
                                    <span>{note.authorId?.name || 'Anonymous'}</span>
                                </div>
                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {notes.length === 0 && (
                    <p className="text-muted-foreground col-span-full py-12 text-center">No notes available yet.</p>
                )}
            </div>
        </div>
    );
}
