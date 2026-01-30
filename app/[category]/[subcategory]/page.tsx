import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Note from '@/models/Note';
// Ensure User model is registered for population
import { FileText, Eye } from 'lucide-react';
import { ViewTracker } from '@/components/ViewTracker';

interface Params {
    params: Promise<{ category: string; subcategory: string }>;
}

export async function generateStaticParams() {
    try {
        await dbConnect();
        // We need to fetch all subcategories and their parent category slug
        // Mongoose populate is easiest
        const subCategories = await SubCategory.find({}).populate('categoryId', 'slug').lean() as unknown as {
            categoryId: { slug: string } | null;
            slug: string;
        }[];

        return subCategories
            .filter((sub) => sub.categoryId && sub.categoryId.slug) // Ensure parent exists and has slug
            .map((sub) => ({
                category: sub.categoryId!.slug,
                subcategory: sub.slug,
            }));
    } catch (e) {
        console.warn('DB connection failed during SSG for subcategories, skipping static generation', e);
        return [];
    }
}

export async function generateMetadata(props: Params) {
    const params = await props.params;
    await dbConnect();
    const subCategory = await SubCategory.findOne({ slug: params.subcategory }).lean() as { name: string; _id: string } | null;
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

    const subCategory = await SubCategory.findOne({ slug: params.subcategory, categoryId: category._id }).lean() as { name: string; _id: string } | null;
    if (!subCategory) return notFound();

    const notes = await Note.find({ subCategoryId: subCategory._id, isPublished: true })
        .sort({ createdAt: -1 })
        .populate('authorId', 'name image')
        .lean() as unknown as {
            _id: string;
            slug: string;
            title: string;
            content: string;
            images?: string[];
            authorId?: { name: string; image?: string };
            views?: number;
            createdAt: string;
        }[];

    return (
        <div className="space-y-8">
            <ViewTracker id={subCategory._id.toString()} type="subcategory" />
            <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <Link href={`/${params.category}`} className="hover:text-primary transition-colors">{category.name}</Link>
                    <span>/</span>
                    <span className="text-foreground">{subCategory.name}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{subCategory.name} Notes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <Link key={note._id} href={`/blog/${note.slug}`} className="group rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 block overflow-hidden h-full flex flex-col">
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            {note.images?.[0] ? (
                                <Image
                                    src={note.images[0]}
                                    alt={note.title}
                                    width={400}
                                    height={225}
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
                                        <Image src={note.authorId.image} width={24} height={24} className="rounded-full object-cover" alt={note.authorId.name} /> :
                                        <div className="w-6 h-6 rounded-full bg-muted"></div>
                                    }
                                    <span>{note.authorId?.name || 'Anonymous'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        <span>{note.views || 0}</span>
                                    </div>
                                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
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
