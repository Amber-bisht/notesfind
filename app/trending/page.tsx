
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Clock, Hash } from 'lucide-react';

export const revalidate = 60; // Revalidate every 60 seconds

async function getTrendingNotes() {
    await dbConnect();
    return Note.find({ isPublished: true })
        .sort({ views: -1 })
        .limit(10)
        .populate('authorId', 'name image')
        .populate('subCategoryId', 'name slug')
        .lean();
}

async function getLatestNotes() {
    await dbConnect();
    return Note.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('authorId', 'name image')
        .populate('subCategoryId', 'name slug')
        .lean();
}

export default async function TrendingPage() {
    const trendingNotes = await getTrendingNotes();
    const latestNotes = await getLatestNotes();

    return (
        <div className="container mx-auto px-4 py-12 space-y-16">
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight">Trending & Latest</h1>
                <p className="text-muted-foreground text-lg">Explore the most popular and newest notes on NotesFind.</p>
            </div>

            {/* Trending Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Hash className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-bold">Trending Notes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {trendingNotes.map((note: any) => (
                        <NoteCard key={note._id} note={note} />
                    ))}
                    {trendingNotes.length === 0 && <p className="text-muted-foreground">No trending notes yet.</p>}
                </div>
            </section>

            {/* Latest Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-bold">Latest Notes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {latestNotes.map((note: any) => (
                        <NoteCard key={note._id} note={note} />
                    ))}
                    {latestNotes.length === 0 && <p className="text-muted-foreground">No notes available yet.</p>}
                </div>
            </section>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NoteCard({ note }: { note: any }) {
    return (
        <Link href={`/blog/${note.slug}`} className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
            <div className="aspect-video bg-muted relative overflow-hidden">
                {note.images?.[0] ? (
                    <Image
                        src={note.images[0]}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 text-4xl font-bold">
                        {note.title.charAt(0)}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">{note.title}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-auto">
                    <span>{note.subCategoryId?.name}</span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t mt-2">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{note.views || 0}</span>
                    </div>
                    {/* Likes could be shown if populated */}
                </div>
            </div>
        </Link>
    );
}
