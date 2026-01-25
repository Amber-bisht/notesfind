"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";

import { NoteForm } from "@/components/NoteForm";

export default function AdminDashboard() {
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "notes">("categories");

    // Forms
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editingNoteData, setEditingNoteData] = useState<any>(null);

    const [catName, setCatName] = useState("");
    const [catSlug, setCatSlug] = useState("");
    const [catDesc, setCatDesc] = useState("");
    const [catRank, setCatRank] = useState("");
    const [catImage, setCatImage] = useState("");

    const [subName, setSubName] = useState("");
    const [subSlug, setSubSlug] = useState("");
    const [subDesc, setSubDesc] = useState("");
    const [subRank, setSubRank] = useState("");
    const [subImage, setSubImage] = useState("");
    const [selectedCatId, setSelectedCatId] = useState("");

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
        fetchNotes();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
    };

    const fetchSubCategories = async () => {
        const res = await fetch("/api/subcategories");
        const data = await res.json();
        setSubCategories(data.subCategories || []);
    };

    const fetchNotes = async () => {
        const res = await fetch("/api/notes");
        const data = await res.json();
        setNotes(data.notes || []);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.url;
        } catch (error: any) {
            console.error(error);
            alert("Upload failed: " + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const resetCategoryForm = () => {
        setEditingId(null);
        setCatName("");
        setCatSlug("");
        setCatDesc("");
        setCatRank("");
        setCatImage("");
    };

    const handleEditCategory = (cat: any) => {
        setEditingId(cat._id);
        setCatName(cat.name);
        setCatSlug(cat.slug);
        setCatDesc(cat.description || "");
        setCatRank(cat.rank);
        setCatImage(cat.image || "");
    };

    const handleSubmitCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const body: any = {
            name: catName,
            slug: catSlug,
            description: catDesc,
            rank: parseInt(catRank),
            image: catImage
        };

        let res;
        if (editingId) {
            res = await fetch(`/api/categories/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });
        } else {
            res = await fetch("/api/categories", {
                method: "POST",
                body: JSON.stringify(body),
            });
        }

        if (res.ok) {
            resetCategoryForm();
            fetchCategories();
        } else {
            const data = await res.json();
            alert(`Failed to ${editingId ? 'update' : 'create'} category: ` + data.error);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) fetchCategories();
    };

    const resetSubCategoryForm = () => {
        setEditingId(null);
        setSubName("");
        setSubSlug("");
        setSubDesc("");
        setSubRank("");
        setSubImage("");
        setSelectedCatId("");
    };

    const handleEditSubCategory = (sub: any) => {
        setEditingId(sub._id);
        setSubName(sub.name);
        setSubSlug(sub.slug);
        setSubDesc(sub.description || "");
        setSubRank(sub.rank);
        setSubImage(sub.image || "");
        setSelectedCatId(sub.categoryId?._id || sub.categoryId);
    };

    const handleSubmitSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = {
            name: subName,
            slug: subSlug,
            description: subDesc,
            rank: parseInt(subRank),
            image: subImage,
            categoryId: selectedCatId
        };

        let res;
        if (editingId) {
            res = await fetch(`/api/subcategories/${editingId}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });
        } else {
            res = await fetch("/api/subcategories", {
                method: "POST",
                body: JSON.stringify(body),
            });
        }

        if (res.ok) {
            resetSubCategoryForm();
            fetchSubCategories();
        } else {
            const data = await res.json();
            alert(`Failed to ${editingId ? 'update' : 'create'} sub-category: ` + data.error);
        }
    };

    const handleDeleteSubCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
        if (res.ok) fetchSubCategories();
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
        if (res.ok) fetchNotes();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            <div className="flex border-b">
                <button
                    onClick={() => { setActiveTab("categories"); resetCategoryForm(); }}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "categories"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Categories
                </button>
                <button
                    onClick={() => { setActiveTab("subcategories"); resetSubCategoryForm(); }}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "subcategories"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Sub-Categories
                </button>
                <button
                    onClick={() => { setActiveTab("notes"); setIsEditingNote(false); setEditingNoteData(null); }}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "notes"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Notes
                </button>
            </div>

            {activeTab === "categories" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Existing Categories</h2>
                        </div>
                        <div className="rounded-md border bg-card">
                            {categories.map((cat) => (
                                <div key={cat._id} className="flex items-center justify-between p-4 border-b last:border-0">
                                    <div className="flex items-center gap-4">
                                        {cat.image && <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded object-cover" />}
                                        <div>
                                            <h3 className="font-medium flex items-center gap-2">
                                                {cat.name} <span className="text-xs bg-muted px-2 py-0.5 rounded">Rank: {cat.rank}</span>
                                            </h3>
                                            <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditCategory(cat)} className="text-primary hover:bg-primary/10 p-2 rounded">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && <p className="p-4 text-center text-muted-foreground">No categories yet.</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{editingId ? "Edit Category" : "Add Category"}</h2>
                            {editingId && (
                                <button onClick={resetCategoryForm} className="text-sm text-destructive flex items-center gap-1">
                                    <X className="w-4 h-4" /> Cancel Edit
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmitCategory} className="space-y-4 p-4 border rounded-xl bg-card">
                            {/* Category Form Content (Same as before) */}
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Slug</label>
                                    <input
                                        type="text"
                                        value={catSlug}
                                        onChange={(e) => setCatSlug(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Rank</label>
                                    <input
                                        type="number"
                                        value={catRank}
                                        onChange={(e) => setCatRank(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={catDesc}
                                    onChange={(e) => setCatDesc(e.target.value)}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Image</label>
                                <div className="flex items-center gap-4 mt-2">
                                    {catImage && <img src={catImage} alt="Preview" className="w-16 h-16 rounded object-cover" />}
                                    <input
                                        type="file"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = await handleUpload(file);
                                                if (url) setCatImage(url);
                                            }
                                        }}
                                        className="text-sm"
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={uploading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {editingId ? "Update Category" : "Create Category"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "subcategories" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Existing Sub-Categories</h2>
                        </div>
                        <div className="rounded-md border bg-card">
                            {subCategories.map((sub) => (
                                <div key={sub._id} className="flex items-center justify-between p-4 border-b last:border-0">
                                    <div className="flex items-center gap-4">
                                        {sub.image && <img src={sub.image} alt={sub.name} className="w-10 h-10 rounded object-cover" />}
                                        <div>
                                            <h3 className="font-medium flex items-center gap-2">
                                                {sub.name} <span className="text-xs bg-muted px-2 py-0.5 rounded">Rank: {sub.rank}</span>
                                            </h3>
                                            <p className="text-xs text-muted-foreground">/{sub.slug} <span className="opacity-50">• {sub.categoryId?.name}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditSubCategory(sub)} className="text-primary hover:bg-primary/10 p-2 rounded">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteSubCategory(sub._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {subCategories.length === 0 && <p className="p-4 text-center text-muted-foreground">No sub-categories yet.</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{editingId ? "Edit Sub-Category" : "Add Sub-Category"}</h2>
                            {editingId && (
                                <button onClick={resetSubCategoryForm} className="text-sm text-destructive flex items-center gap-1">
                                    <X className="w-4 h-4" /> Cancel Edit
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmitSubCategory} className="space-y-4 p-4 border rounded-xl bg-card">
                            <div>
                                <label className="text-sm font-medium">Parent Category</label>
                                <select
                                    value={selectedCatId}
                                    onChange={(e) => setSelectedCatId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            {/* SubCategory Form Content (Same as before) */}
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={subName}
                                    onChange={(e) => setSubName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Slug</label>
                                    <input
                                        type="text"
                                        value={subSlug}
                                        onChange={(e) => setSubSlug(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Rank</label>
                                    <input
                                        type="number"
                                        value={subRank}
                                        onChange={(e) => setSubRank(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={subDesc}
                                    onChange={(e) => setSubDesc(e.target.value)}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Image</label>
                                <div className="flex items-center gap-4 mt-2">
                                    {subImage && <img src={subImage} alt="Preview" className="w-16 h-16 rounded object-cover" />}
                                    <input
                                        type="file"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = await handleUpload(file);
                                                if (url) setSubImage(url);
                                            }
                                        }}
                                        className="text-sm"
                                        accept="image/*"
                                        disabled={uploading}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={uploading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {editingId ? "Update Sub-Category" : "Create Sub-Category"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "notes" && (
                <div className="space-y-8">
                    {!isEditingNote ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Existing Notes</h2>
                                <button
                                    onClick={() => { setIsEditingNote(true); setEditingNoteData(null); }}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Note
                                </button>
                            </div>
                            <div className="rounded-md border bg-card">
                                {notes.map((note) => (
                                    <div key={note._id} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div className="flex items-center gap-4">
                                            {note.images?.[0] && <img src={note.images[0]} alt={note.title} className="w-10 h-10 rounded object-cover" />}
                                            <div>
                                                <h3 className="font-medium flex items-center gap-2">
                                                    {note.title} <span className="text-xs bg-muted px-2 py-0.5 rounded">Rank: {note.rank}</span>
                                                </h3>
                                                <p className="text-xs text-muted-foreground">/{note.slug} <span className="opacity-50">• {note.subCategoryId?.name}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingNoteData(note); setIsEditingNote(true); }} className="text-primary hover:bg-primary/10 p-2 rounded">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteNote(note._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {notes.length === 0 && <p className="p-4 text-center text-muted-foreground">No notes yet.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 border p-4 rounded-xl bg-card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">{editingNoteData ? "Edit Note" : "Create Note"}</h2>
                            </div>
                            <NoteForm
                                initialData={editingNoteData}
                                onSuccess={() => { setIsEditingNote(false); fetchNotes(); }}
                                onCancel={() => setIsEditingNote(false)}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
