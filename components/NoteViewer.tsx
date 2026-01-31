
"use client";

import { useRef, useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Eye, ThumbsUp, ExternalLink, Download } from 'lucide-react';
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

                {note.type !== 'external' && (
                    <NotePDFButton contentRef={contentRef} noteTitle={note.title} noteId={note._id} noteSlug={note.slug} />
                )}
            </div>

            <article ref={contentRef} className="space-y-8 p-8 bg-background border rounded-3xl shadow-sm">
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

                {note.type === 'external' ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Download className="w-10 h-10" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h2 className="text-2xl font-bold">External Resource</h2>
                            <p className="text-muted-foreground italic">
                                This note is hosted externally. Click the button below to view or download the resource.
                            </p>
                        </div>
                        <a
                            href={note.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            <ExternalLink className="w-5 h-5" /> Open Resource
                        </a>
                        <p className="text-xs text-muted-foreground font-medium">
                            URL: <span className="underline">{note.externalUrl}</span>
                        </p>
                    </div>
                ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {note.content.split('\n').map((line: string, i: number) => (
                            <p key={i}>{line}</p>
                        ))}

                        {note.images && note.images.length > 0 && (
                            <div className="grid gap-4 my-8">
                                {note.images.map((img: string, i: number) => (
                                    <figure key={i}>
                                        <Image src={img} alt={`Note image ${i + 1}`} width={800} height={600} className="rounded-xl border shadow-sm w-full h-auto" />
                                    </figure>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer for PDF only */}
                <div className="mt-20 pt-8 border-t text-center text-sm text-muted-foreground hidden print:block">
                    <p>Downloaded from NotesFind</p>
                </div>
            </article>
        </div>
    );
}
