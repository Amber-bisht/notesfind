"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface Category {
    _id: string;
    name: string;
}

interface SubCategory {
    _id: string;
    name: string;
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
    const [rank, setRank] = useState(initialData?.rank || "");
    const [subCategoryId, setSubCategoryId] = useState(initialData?.subCategoryId?._id || initialData?.subCategoryId || "");
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedCatId, setSelectedCatId] = useState(""); // For filtering subcats
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [uploading, setUploading] = useState(false);

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
        // Fetch categories and subcategories to populate select
        // Optimally we fetch subcategories filtered by category
        fetchCategories();
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
        const body = { title, slug, content, rank: parseInt(rank), subCategoryId, images };

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
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
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
                <label className="text-sm font-medium">Rank</label>
                <input
                    type="number"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
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

            <div className="flex justify-end gap-2">
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
