import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Note from '@/models/Note';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface Params {
    params: Promise<{ category: string; subcategory: string; slug: string }>;
}

export async function generateStaticParams() {
    try {
        await dbConnect();
        // Fetch latest 100 notes for static generation to save build time, others dynamic
        const notes = await Note.find({ isPublished: true }).sort({ createdAt: -1 }).limit(100).populate({
            path: 'subCategoryId',
            populate: { path: 'categoryId' }
        }).lean();

        return notes
            .filter((note: any) => note.subCategoryId && note.subCategoryId.categoryId)
            .map((note: any) => ({
                category: note.subCategoryId.categoryId.slug,
                subcategory: note.subCategoryId.slug,
                slug: note.slug,
            }));
    } catch (e) {
        console.warn('DB connection failed during SSG for notes, skipping static generation');
        return [];
    }
}

export async function generateMetadata(props: Params) {
    const params = await props.params;
    await dbConnect();
    const note = await Note.findOne({ slug: params.slug }).lean() as any;
    if (!note) return { title: 'Not Found' };

    return {
        title: `${note.title} - NotesFind`,
        description: note.content.substring(0, 160),
        openGraph: {
            images: note.images?.[0] ? [note.images[0]] : [],
        }
    };
}

export default async function NotePage(props: Params) {
    const params = await props.params;
    await dbConnect();

    const note = await Note.findOne({ slug: params.slug }).populate('authorId').populate('subCategoryId').lean() as any;

    if (!note) return notFound();

    // Optional: Verify subcategory/category match if we want to be strict URL-wise
    // For now we trust slug is unique enough or we don't care if accessed via different path (canonical canonicals solve this)

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="space-y-4">
                <Link href={`/${params.category}/${params.subcategory}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {note.subCategoryId?.name}
                </Link>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">{note.title}</h1>

                <div className="flex items-center gap-6 text-sm text-muted-foreground border-b pb-8">
                    <div className="flex items-center gap-2">
                        {note.authorId?.image ? <img src={note.authorId.image} className="w-8 h-8 rounded-full" alt="" /> : <User className="w-5 h-5" />}
                        <span className="font-medium text-foreground">{note.authorId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                {/* Simple whitespace rendering for now, or could use a markdown parser */}
                {note.content.split('\n').map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                ))}

                {note.images && note.images.length > 0 && (
                    <div className="grid gap-4 my-8">
                        {note.images.map((img: string, i: number) => (
                            <figure key={i}>
                                <img src={img} alt={`Note image ${i + 1}`} className="rounded-xl border shadow-sm w-full" />
                            </figure>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
