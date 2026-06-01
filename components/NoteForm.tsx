"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Eye, Pencil } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Category {
    _id: string;
    name: string;
}

interface SubCategory {
    _id: string;
    name: string;
    slug: string;
    categoryId: string | Category;
}

interface NoteFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function NoteForm({ initialData, onSuccess, onCancel }: NoteFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [subCategoryId, setSubCategoryId] = useState(initialData?.subCategoryId?._id || initialData?.subCategoryId || "");
    const [type, setType] = useState<"internal" | "external">(initialData?.type || "internal");
    const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl || "");
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedCatId, setSelectedCatId] = useState(""); // For filtering subcats
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [uploading, setUploading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
    };

    const fetchSubCategories = async (catId: string) => {
        const res = await fetch(`/api/subcategories?categoryId=${catId}`);
        const data = await res.json();
        setSubCategories(data.subCategories || []);
    };

    const fetchAllSubCategories = async () => {
        const res = await fetch("/api/subcategories");
        const data = await res.json();
        const subs = data.subCategories || [];
        setSubCategories(subs);
        // Try to find the category
        if (initialData?.subCategoryId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sub = subs.find((s: any) => s._id === (initialData.subCategoryId._id || initialData.subCategoryId));
            if (sub && sub.categoryId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSelectedCatId((sub.categoryId as any)._id || sub.categoryId);
            }
        }
    };

    useEffect(() => {
        fetchCategories();
        // Fetch current user for access filtering
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user || null)).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedCatId) {
            fetchSubCategories(selectedCatId);
        } else {
            setSubCategories([]);
        }
    }, [selectedCatId]);

    // If editing, try to set category based on subcategory
    useEffect(() => {
        if (initialData && initialData.subCategoryId && !selectedCatId) {
            // We would need to know the category of the subcategory.
            // For simplicity, let's just fetch all subcategories or modify the API to return category info.
            // Or just fetch all subcategories for now (might be inefficient if many).
            // Let's fetch all subcategories flat list for now to find the matching one.
            fetchAllSubCategories();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // New upload flow uses /api/upload
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setImages([...images, data.url]);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Auto-calculate rank: keep existing for edits, compute next for new
        let autoRank = initialData?.rank ?? 1;
        if (!initialData) {
            try {
                const notesRes = await fetch('/api/notes');
                const notesData = await notesRes.json();
                const allNotes = notesData.notes || [];
                autoRank = Math.max(0, ...allNotes.map((n: any) => n.rank ?? 0)) + 1; // eslint-disable-line @typescript-eslint/no-explicit-any
            } catch { autoRank = 1; }
        }
        // Auto-prefix slug with subcategory slug for better SEO
        let finalSlug = slug.trim();
        const subCat = subCategories.find(s => s._id === subCategoryId);
        if (subCat && subCat.slug && !finalSlug.startsWith(`${subCat.slug}-`)) {
            finalSlug = `${subCat.slug}-${finalSlug}`;
        }

        const body = { title, slug: finalSlug, content, rank: autoRank, subCategoryId, images, type, externalUrl };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let res: any;

        if (initialData) {
            // Update
            res = await fetch(`/api/notes/${initialData._id}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });
        } else {
            // Create
            res = await fetch("/api/notes", {
                method: "POST",
                body: JSON.stringify(body)
            });
        }

        if (res.ok) onSuccess();
        else {
            const data = await res.json();
            alert("Failed: " + data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className={type === "internal" ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "space-y-6"}>
                {/* LEFT SIDE: FORM */}
                <div className={type === "internal" ? "lg:col-span-6 space-y-6" : "space-y-6"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                value={selectedCatId}
                                onChange={(e) => setSelectedCatId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required={!initialData} // only required if creating new or changing
                            >
                                <option value="">Select Category</option>
                                {categories
                                    .filter(c => !user || user.role === 'owner' || user.assignedCategories?.includes(c._id))
                                    .map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sub-Category</label>
                            <select
                                value={subCategoryId}
                                onChange={(e) => setSubCategoryId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value="">Select Sub-Category</option>
                                {subCategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Note Type</label>
                        <div className="flex bg-muted p-1 rounded-xl w-fit">
                            <button
                                type="button"
                                onClick={() => setType("internal")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === "internal" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                            >
                                Internal (Built-in)
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("external")}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === "external" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                            >
                                External (Link)
                            </button>
                        </div>
                    </div>

                    {type === "external" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">External URL (Redirect/Download Link)</label>
                            <input
                                type="url"
                                value={externalUrl}
                                onChange={(e) => setExternalUrl(e.target.value)}
                                placeholder="https://example.com/notes.pdf"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required={type === "external"}
                            />
                        </div>
                    )}

                    {type === "internal" && (
                        <>
                            <div className="space-y-2 flex flex-col flex-1">
                                <label className="text-sm font-medium">Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="flex min-h-[250px] lg:min-h-[350px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                                    placeholder="Write your content in Markdown..."
                                    required={type === "internal"}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Images</label>
                                <div className="flex flex-wrap gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 group">
                                            <Image
                                                src={img}
                                                alt="Uploaded"
                                                width={80}
                                                height={80}
                                                className="object-cover rounded"
                                                unoptimized
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50 transition-colors">
                                        <input type="file" onChange={handleUpload} className="hidden" accept="image/*" disabled={uploading} />
                                        {uploading ? <span className="text-xs">Processing...</span> : <Upload className="w-6 h-6 text-muted-foreground" />}
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT SIDE: LIVE PREVIEW */}
                {type === "internal" && (
                    <div className="lg:col-span-6 border rounded-2xl bg-card overflow-hidden min-h-[450px] lg:h-[70vh] flex flex-col shadow-inner">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b shrink-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-primary" /> Live Preview
                            </span>
                            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                                Real-time
                            </span>
                        </div>

                        {/* Preview Content Pane */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                        {subCategories.find(s => s._id === subCategoryId)?.name || "Sub-Category"}
                                    </span>
                                    <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
                                        {title.trim() ? title : <span className="text-muted-foreground/30 italic">Untitled Note</span>}
                                    </h1>
                                </div>
                                <div className="border-b pb-4 text-xs text-muted-foreground flex items-center gap-3">
                                    <span>By Author</span>
                                    <span>•</span>
                                    <span>Just now</span>
                                </div>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none mt-6">
                                {content.trim() ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                            img({ node, ...props }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                                                return <img {...props} className="rounded-lg border shadow-sm max-w-full h-auto my-4" />;
                                            }
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">Start writing on the left to see the live rendered Markdown preview...</p>
                                )}
                            </div>

                            {images && images.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative aspect-video rounded-xl overflow-hidden border bg-muted shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt="" className="object-cover w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t shrink-0">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded-md">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                    {initialData ? "Update Note" : "Create Note"}
                </button>
            </div>
        </form>
    );
}
