import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import "@/models/SubCategory"; // Register SubCategory model
import "@/models/Category"; // Register Category model
import { FileText, Calendar } from "lucide-react";

export const metadata = {
    title: "Browse All Notes | NotesFind",
    description: "Explore our top rated, newest, and classic notes.",
};

interface PageNote {
    _id: string;
    title: string;
    slug: string;
    rank?: number;
    createdAt: Date;
    images: string[];
    subCategoryId?: {
        slug: string;
        categoryId?: {
            slug: string;
        };
    };
    authorId?: {
        name: string;
        image?: string;
    };
}

export default async function Pages() {
    await dbConnect();

    // Fetch all published notes populated with subCategory
    const allNotes = await Note.find({ isPublished: true })
        .populate({
            path: 'subCategoryId',
            populate: { path: 'categoryId' }
        })
        .populate('authorId', 'name image')
        .lean();

    // 1. Top Notes (Sorted by rank asc, then createdAt desc)
    // Assuming 'rank' field is used for "top" prioritization as implemented in Note model.
    // If no rank, we can fallback to other metrics. User said "rank - 1,2,3,4 etc".
    // Let's filter notes that have a rank first.
    // Let's filter notes that have a rank first.
    const notesWithRank = (allNotes as unknown as PageNote[]).filter((n) => n.rank !== undefined && n.rank !== null);
    const topNotes = notesWithRank.sort((a, b) => (a.rank || 0) - (b.rank || 0)).slice(0, 10);

    // If few notes have rank, maybe just take random or all?
    // Let's fallback to just taking the first 10 if rank isn't widely used yet, or mix.
    // Actually, 'top' usually implies quality or popularity. Rank seems to be the manual curated 'top'.

    // 2. Newest Notes
    // Clone to avoid mutating if we want to reuse allNotes, but filter/map creates new arrays mostly.
    const newestNotes = [...(allNotes as unknown as PageNote[])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    // 3. Oldest Notes
    const oldestNotes = [...(allNotes as unknown as PageNote[])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(0, 10);

    return (
        <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
                        Explore Notes
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover the best resources, fresh arrivals, and timeless classics.
                    </p>
                </div>

                {/* Top Notes Section */}
                <section>
                    <div className="flex items-center gap-2 mb-8">
                        <h2 className="text-3xl font-bold">Top Notes</h2>
                        <div className="h-1 flex-1 bg-border ml-4"></div>
                    </div>
                    <NoteGrid notes={topNotes} emptyMessage="No top ranked notes yet." />
                </section>

                {/* Newest Notes Section */}
                <section>
                    <div className="flex items-center gap-2 mb-8">
                        <h2 className="text-3xl font-bold">Newest Additions</h2>
                        <div className="h-1 flex-1 bg-border ml-4"></div>
                    </div>
                    <NoteGrid notes={newestNotes} emptyMessage="No notes added yet." />
                </section>

                {/* Oldest Notes Section */}
                <section>
                    <div className="flex items-center gap-2 mb-8">
                        <h2 className="text-3xl font-bold">Classics (Oldest)</h2>
                        <div className="h-1 flex-1 bg-border ml-4"></div>
                    </div>
                    <NoteGrid notes={oldestNotes} emptyMessage="No notes found." />
                </section>

            </div>
        </div>
    );
}

function NoteGrid({ notes, emptyMessage }: { notes: PageNote[], emptyMessage: string }) {
    if (notes.length === 0) {
        return <div className="text-muted-foreground italic">{emptyMessage}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {notes.map((note) => {
                const categorySlug = note.subCategoryId?.categoryId?.slug || 'cal';
                const subCategorySlug = note.subCategoryId?.slug || 'sub';

                return (
                    <Link
                        key={note._id}
                        href={`/${categorySlug}/${subCategorySlug}/${note.slug}`}
                        className="group flex flex-col h-full border rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300"
                    >
                        {/* Image Section */}
                        <div className="aspect-video w-full bg-muted relative overflow-hidden">
                            {note.images && note.images[0] ? (
                                <Image
                                    src={note.images[0]}
                                    alt={note.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                    <FileText className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                {note.title}
                            </h3>

                            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                                <span className="flex items-center gap-1">
                                    {note.authorId?.name || "Anonymous"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
