"use client";

import { useRef, useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Eye, ExternalLink, Download } from 'lucide-react';
import { NotePDFButton } from "./NotePDFButton";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface NoteViewerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    note: any;
    categorySlug?: string;
    subCategorySlug?: string;
    currentUser?: string | null;
}

export function NoteViewer({ note, categorySlug, subCategorySlug, currentUser }: NoteViewerProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [views, setViews] = useState(note.views || 0);

    useEffect(() => {
        // Increment view count
        // Increment view count after a 5-second delay to prevent spam and ensure real reading
        const timer = setTimeout(async () => {
            try {
                const res = await fetch('/api/notes/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: note._id }),
                });
            } catch (error) {
                console.error("Failed to increment view", error);
            }
        }, 5000); // 5 second delay

        return () => clearTimeout(timer);
    }, [note._id]);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8 bg-muted/50 p-4 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4">
                    {categorySlug && subCategorySlug ? (
                        <Link href={`/${categorySlug}/${subCategorySlug}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Link>
                    ) : (
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Home
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border rounded-xl text-sm font-medium text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{views} views</span>
                    </div>

                    {note.type !== 'external' && (
                        <NotePDFButton contentRef={contentRef} noteTitle={note.title} noteId={note._id} noteSlug={note.slug} />
                    )}
                </div>
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
                                <span suppressHydrationWarning>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
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
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                // Make standard images responsive and stylish
                                img({ node, ...props }) {
                                    return <img {...props} className="rounded-xl border shadow-sm max-w-full h-auto my-8" />;
                                }
                            }}
                        >
                            {note.content}
                        </ReactMarkdown>

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
