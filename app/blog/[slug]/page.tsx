import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
// Ensure User model is registered for population
import { NoteViewer } from '@/components/NoteViewer';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

interface Params {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    try {
        await dbConnect();
        const notes = await Note.find({ isPublished: true }).sort({ createdAt: -1 }).limit(100).select('slug').lean();
        return notes.map((note: { slug: string }) => ({
            slug: note.slug,
        }));
    } catch (e) {
        console.warn('DB connection failed during SSG for blog posts', e);
        return [];
    }
}

export async function generateMetadata(props: Params) {
    const params = await props.params;
    await dbConnect();
    const note = await Note.findOne({ slug: params.slug }).lean() as { title: string; content: string; images?: string[] } | null;
    if (!note) return { title: 'Not Found' };

    return {
        title: `${note.title}`,
        description: note.content.substring(0, 160),
        openGraph: {
            images: note.images?.[0] ? [note.images[0]] : [],
        }
    };
}

export default async function NotePage(props: Params) {
    const params = await props.params;
    await dbConnect();

    const note = await Note.findOne({ slug: params.slug })
        .populate('authorId')
        .populate({
            path: 'subCategoryId',
            populate: { path: 'categoryId' }
        })
        .lean() as {
            _id: string;
            title: string;
            content: string;
            images?: string[];
            subCategoryId?: { _id: string; slug: string; name: string; categoryId?: { slug: string; name: string } };
            likes?: string[];

        } | null;

    if (!note) return notFound();

    // Fetch related notes in the same subcategory
    const relatedNotes = await Note.find({
        subCategoryId: note.subCategoryId?._id,
        _id: { $ne: note._id },
        isPublished: true
    })
        .sort({ rank: 1, createdAt: -1 })
        .limit(3)
        .populate('authorId', 'name')
        .lean();

    const serializedNote = JSON.parse(JSON.stringify(note));
    const serializedRelated = JSON.parse(JSON.stringify(relatedNotes));

    const categorySlug = note.subCategoryId?.categoryId?.slug;
    const subCategorySlug = note.subCategoryId?.slug;

    // Check user like status
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUserId = "";
    let isLiked = false;

    if (token) {
        const payload = await verifyToken(token);
        if (payload) {
            currentUserId = payload.userId;
            if (note.likes && Array.isArray(note.likes)) {
                isLiked = note.likes.some((id: unknown) => id?.toString() === currentUserId);
            }
        }
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Custom Header / Breadcrumb for Blog */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    {categorySlug && (
                        <>
                            <Link href={`/${categorySlug}`} className="hover:text-primary transition-colors">{note.subCategoryId?.categoryId?.name}</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                        </>
                    )}
                    {subCategorySlug && (
                        <>
                            <Link href={`/${categorySlug}/${subCategorySlug}`} className="hover:text-primary transition-colors">{note.subCategoryId?.name}</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                        </>
                    )}
                    <span className="font-semibold text-foreground truncate max-w-[200px]">{note.title}</span>
                </div>
            </div>

            {/* Main Content */}
            <NoteViewer
                note={serializedNote}
                categorySlug={categorySlug}
                subCategorySlug={subCategorySlug}
                currentUser={currentUserId}
                initialIsLiked={isLiked}
            />

            {/* "More in this topic" Section */}
            {serializedRelated.length > 0 && (
                <div className="container mx-auto px-4 max-w-4xl mt-16 border-t pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">More in {note.subCategoryId?.name}</h3>
                        <Link href={`/${categorySlug ?? ''}/${subCategorySlug ?? ''}`} className="text-primary font-medium hover:underline flex items-center">
                            View All <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {serializedRelated.map((rel: { _id: string; slug: string; title: string; images?: string[]; createdAt: string }) => (
                            <Link key={rel._id} href={`/blog/${rel.slug}`} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                                <div className="aspect-video bg-muted relative">
                                    {rel.images?.[0] ? (
                                        <Image src={rel.images[0]} alt={rel.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary/40"><BookOpen className="w-8 h-8" /></div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold line-clamp-2 group-hover:text-primary transition-colors mb-2">{rel.title}</h4>
                                    <span className="text-xs text-muted-foreground">{new Date(rel.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Back Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 md:hidden z-40">
                <Link href={`/${categorySlug}/${subCategorySlug}`} className="flex items-center justify-center w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {note.subCategoryId?.name}
                </Link>
            </div>
        </div>
    );
}
