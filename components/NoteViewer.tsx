
"use client";

import { useRef, useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Eye, ThumbsUp } from 'lucide-react';
import { NotePDFButton } from "./NotePDFButton";
// import { toast } from "react-hot-toast";

interface NoteViewerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    note: any;
    categorySlug?: string;
    subCategorySlug?: string;
    currentUser?: string | null;
    initialIsLiked?: boolean;
}

export function NoteViewer({ note, categorySlug, subCategorySlug, currentUser, initialIsLiked = false }: NoteViewerProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [views, setViews] = useState(note.views || 0);
    const [likes, setLikes] = useState(note.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        // Increment view count
        const incrementView = async () => {
            try {
                const res = await fetch('/api/notes/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: note._id }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setViews(data.views);
                }
            } catch (error) {
                console.error("Failed to increment view", error);
            }
        };

        incrementView();
    }, [note._id]);

    const handleLike = async () => {
        if (!currentUser) {
            // toast.error("Please login to like notes");
            alert("Please login to like notes");
            return;
        }

        if (isLiking) return;
        setIsLiking(true);

        try {
            const res = await fetch('/api/notes/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId: note._id }),
            });

            if (res.ok) {
                const data = await res.json();
                setLikes(data.likesCount);
                setIsLiked(data.isLiked);
                if (data.isLiked) {
                    // toast.success("Liked!");
                }
            } else {
                // toast.error("Failed to like note");
            }
        } catch (error) {
            console.error("Error liking note", error);
            // toast.error("Something went wrong");
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-8">
                {categorySlug && subCategorySlug ? (
                    <Link href={`/${categorySlug}/${subCategorySlug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to {note.subCategoryId?.name || 'Topic'}
                    </Link>
                ) : (
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                )}

                <NotePDFButton contentRef={contentRef} noteTitle={note.title} noteId={note._id} noteSlug={note.slug} />
            </div>

            <article ref={contentRef} className="space-y-8 p-8 bg-background">
                {/* Added bg-background and padding to ensure PDF looks like a page */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">{note.title}</h1>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-8">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                {note.authorId?.image ? <Image src={note.authorId.image} width={32} height={32} className="rounded-full object-cover" alt="" /> : <User className="w-5 h-5" />}
                                <span className="font-medium text-foreground">{note.authorId?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5" title={`${views} views`}>
                                <Eye className="w-4 h-4" />
                                <span>{views}</span>
                            </div>
                            <button
                                onClick={handleLike}
                                disabled={isLiking}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${isLiked ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                title={currentUser ? (isLiked ? "Unlike" : "Like") : "Login to like"}
                            >
                                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{likes}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    {note.content.split('\n').map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                    ))}

                    {note.images && note.images.length > 0 && (
                        <div className="grid gap-4 my-8">
                            {note.images.map((img: string, i: number) => (
                                <figure key={i}>
                                    {/* Use standard img for better html2canvas compatibility than Next/Image - Keeping Image here as requested but using unoptimized might help if needed */}
                                    <Image src={img} alt={`Note image ${i + 1}`} width={800} height={600} className="rounded-xl border shadow-sm w-full h-auto" />
                                </figure>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer for PDF only */}
                <div className="mt-20 pt-8 border-t text-center text-sm text-muted-foreground hidden print:block">
                    <p>Downloaded from NotesFind</p>
                </div>
            </article>
        </div>
    );
}
