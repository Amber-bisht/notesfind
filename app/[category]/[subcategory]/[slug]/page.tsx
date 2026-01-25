import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NoteViewer } from '@/components/NoteViewer';

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

    // Serialize object for client component
    const serializedNote = JSON.parse(JSON.stringify(note));

    return (
        <NoteViewer
            note={serializedNote}
            categorySlug={params.category}
            subCategorySlug={params.subcategory}
        />
    );
}
