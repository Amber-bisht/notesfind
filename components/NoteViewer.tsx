"use client";

import { useRef } from "react";
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { NotePDFButton } from "./NotePDFButton";

interface NoteViewerProps {
    note: any;
    categorySlug: string;
    subCategorySlug: string;
}

export function NoteViewer({ note, categorySlug, subCategorySlug }: NoteViewerProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-start mb-8">
                <Link href={`/${categorySlug}/${subCategorySlug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {note.subCategoryId?.name}
                </Link>

                <NotePDFButton contentRef={contentRef} noteTitle={note.title} noteId={note._id} noteSlug={note.slug} />
            </div>

            <article ref={contentRef} className="space-y-8 p-8 bg-background">
                {/* Added bg-background and padding to ensure PDF looks like a page */}
                <div className="space-y-4">
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
                    {note.content.split('\n').map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                    ))}

                    {note.images && note.images.length > 0 && (
                        <div className="grid gap-4 my-8">
                            {note.images.map((img: string, i: number) => (
                                <figure key={i}>
                                    {/* Use standard img for better html2canvas compatibility than Next/Image */}
                                    <img src={img} alt={`Note image ${i + 1}`} className="rounded-xl border shadow-sm w-full" />
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
