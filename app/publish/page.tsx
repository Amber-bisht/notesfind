"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Lock, Unlock, GripVertical } from "lucide-react";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { NoteForm } from "@/components/NoteForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableCatItem({ cat, canManage, onEdit, onDelete }: { cat: any; canManage: boolean; onEdit: (cat: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat._id, disabled: !canManage });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 border-b last:border-0 bg-card ${!canManage ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
                {canManage && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none">
                        <GripVertical className="w-4 h-4" />
                    </button>
                )}
                {cat.image && <Image src={cat.image} alt={cat.name} width={40} height={40} className="rounded object-cover" unoptimized />}
                <div>
                    <h3 className="font-medium flex items-center gap-2">
                        {cat.name}
                        {canManage ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                                <Unlock className="w-3 h-3" /> You can manage
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                                <Lock className="w-3 h-3" /> No access
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
            </div>
            {canManage && (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(cat)} className="text-primary hover:bg-primary/10 p-2 rounded">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(cat._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableSubItem({ sub, canManage, onEdit, onDelete }: { sub: any; canManage: boolean; onEdit: (sub: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub._id, disabled: !canManage });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 border-b last:border-0 bg-card ${!canManage ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
                {canManage && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none">
                        <GripVertical className="w-4 h-4" />
                    </button>
                )}
                {sub.image && <Image src={sub.image} alt={sub.name} width={40} height={40} className="rounded object-cover" unoptimized />}
                <div>
                    <h3 className="font-medium flex items-center gap-2">
                        {sub.name}
                        {canManage ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                                <Unlock className="w-3 h-3" /> You can manage
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                                <Lock className="w-3 h-3" /> No access
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground">/{sub.slug} <span className="opacity-50">• {sub.categoryId?.name}</span></p>
                </div>
            </div>
            {canManage && (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(sub)} className="text-primary hover:bg-primary/10 p-2 rounded">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(sub._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableNoteItem({ note, canManage, onEdit, onDelete }: { note: any; canManage: boolean; onEdit: (note: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note._id, disabled: !canManage });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 border-b last:border-0 bg-card ${!canManage ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
                {canManage && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none">
                        <GripVertical className="w-4 h-4" />
                    </button>
                )}
                {note.images?.[0] && <Image src={note.images[0]} alt={note.title} width={40} height={40} className="rounded object-cover" unoptimized />}
                <div>
                    <h3 className="font-medium flex items-center gap-2">
                        {note.title}
                        {canManage ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                                <Unlock className="w-3 h-3" /> You can manage
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                                <Lock className="w-3 h-3" /> No access
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground">/{note.slug} <span className="opacity-50">• {note.subCategoryId?.name}</span></p>
                </div>
            </div>
            {canManage && (
                <div className="flex gap-2">
                    <button onClick={() => onEdit(note)} className="text-primary hover:bg-primary/10 p-2 rounded">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(note._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function PublishPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [categories, setCategories] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subCategories, setSubCategories] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [notes, setNotes] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "notes">("categories");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    // Forms
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isEditingNote, setIsEditingNote] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingNoteData, setEditingNoteData] = useState<any>(null);

    const [catName, setCatName] = useState("");
    const [catSlug, setCatSlug] = useState("");
    const [catDesc, setCatDesc] = useState("");
    const [catImage, setCatImage] = useState("");

    const [subName, setSubName] = useState("");
    const [subSlug, setSubSlug] = useState("");
    const [subDesc, setSubDesc] = useState("");
    const [subImage, setSubImage] = useState("");
    const [selectedCatId, setSelectedCatId] = useState("");

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
        fetchNotes();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        }
    };

    // Check if current user has access to a category
    const hasAccess = (categoryId: string) => {
        if (!user) return false;
        if (user.role === 'owner') return true;
        return user.assignedCategories?.includes(categoryId);
    };

    // Check if user has access to a note (via its subcategory's parent category)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasNoteAccess = (note: any) => {
        if (!user) return false;
        if (user.role === 'owner') return true;
        const subCatId = note.subCategoryId?._id || note.subCategoryId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = subCategories.find((s: any) => s._id === subCatId);
        if (!sub) return false;
        const parentCatId = sub.categoryId?._id || sub.categoryId;
        return hasAccess(parentCatId);
    };

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
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
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
        setCatImage("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditCategory = (cat: any) => {
        setEditingId(cat._id);
        setCatName(cat.name);
        setCatSlug(cat.slug);
        setCatDesc(cat.description || "");
        setCatImage(cat.image || "");
    };

    const handleCatDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const sorted = [...categories].sort((a, b) => a.rank - b.rank);
        const oldIndex = sorted.findIndex((c) => c._id === active.id);
        const newIndex = sorted.findIndex((c) => c._id === over.id);
        const reordered = arrayMove(sorted, oldIndex, newIndex);
        setCategories(reordered.map((c, i) => ({ ...c, rank: i + 1 })));
        await fetch('/api/categories/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: reordered.map((c, i) => ({ id: c._id, rank: i + 1 })) }),
        });
        fetchCategories();
    };

    const handleSubmitCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextRank = editingId
            ? categories.find((c: any) => c._id === editingId)?.rank ?? categories.length + 1 // eslint-disable-line @typescript-eslint/no-explicit-any
            : Math.max(0, ...categories.map((c: any) => c.rank ?? 0)) + 1; // eslint-disable-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = {
            name: catName,
            slug: catSlug,
            description: catDesc,
            rank: nextRank,
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
        setSubImage("");
        setSelectedCatId("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditSubCategory = (sub: any) => {
        setEditingId(sub._id);
        setSubName(sub.name);
        setSubSlug(sub.slug);
        setSubDesc(sub.description || "");
        setSubImage(sub.image || "");
        setSelectedCatId(sub.categoryId?._id || sub.categoryId);
    };

    const handleSubDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const sorted = [...subCategories].sort((a, b) => a.rank - b.rank);
        const oldIndex = sorted.findIndex((s) => s._id === active.id);
        const newIndex = sorted.findIndex((s) => s._id === over.id);
        const reordered = arrayMove(sorted, oldIndex, newIndex);
        setSubCategories(reordered.map((s, i) => ({ ...s, rank: i + 1 })));
        await fetch('/api/subcategories/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: reordered.map((s, i) => ({ id: s._id, rank: i + 1 })) }),
        });
        fetchSubCategories();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSubmitSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextSubRank = editingId
            ? subCategories.find((s: any) => s._id === editingId)?.rank ?? subCategories.length + 1 // eslint-disable-line @typescript-eslint/no-explicit-any
            : Math.max(0, ...subCategories.map((s: any) => s.rank ?? 0)) + 1; // eslint-disable-line @typescript-eslint/no-explicit-any
        const body = {
            name: subName,
            slug: subSlug,
            description: subDesc,
            rank: nextSubRank,
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

    const handleNoteDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const sorted = [...notes].sort((a, b) => a.rank - b.rank);
        const oldIndex = sorted.findIndex((n) => n._id === active.id);
        const newIndex = sorted.findIndex((n) => n._id === over.id);
        const reordered = arrayMove(sorted, oldIndex, newIndex);
        setNotes(reordered.map((n, i) => ({ ...n, rank: i + 1 })));
        await fetch('/api/notes/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: reordered.map((n, i) => ({ id: n._id, rank: i + 1 })) }),
        });
        fetchNotes();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Publishing Studio</h1>
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
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                            <SortableContext items={[...categories].sort((a, b) => a.rank - b.rank).map(c => c._id)} strategy={verticalListSortingStrategy}>
                                <div className="rounded-md border bg-card">
                                    {[...categories].sort((a, b) => a.rank - b.rank).map((cat) => {
                                        const canManage = hasAccess(cat._id);
                                        return <SortableCatItem key={cat._id} cat={cat} canManage={canManage} onEdit={handleEditCategory} onDelete={handleDeleteCategory} />;
                                    })}
                                    {categories.length === 0 && <p className="p-4 text-center text-muted-foreground">No categories yet.</p>}
                                </div>
                            </SortableContext>
                        </DndContext>
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
                            {/* Category Form Content */}
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
                                    {catImage && <Image src={catImage} alt="Preview" width={64} height={64} className="rounded object-cover" unoptimized />}
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
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
                            <SortableContext items={[...subCategories].sort((a, b) => a.rank - b.rank).map(s => s._id)} strategy={verticalListSortingStrategy}>
                                <div className="rounded-md border bg-card">
                                    {[...subCategories].sort((a, b) => a.rank - b.rank).map((sub) => {
                                        const parentCatId = sub.categoryId?._id || sub.categoryId;
                                        const canManage = hasAccess(parentCatId);
                                        return <SortableSubItem key={sub._id} sub={sub} canManage={canManage} onEdit={handleEditSubCategory} onDelete={handleDeleteSubCategory} />;
                                    })}
                                    {subCategories.length === 0 && <p className="p-4 text-center text-muted-foreground">No sub-categories yet.</p>}
                                </div>
                            </SortableContext>
                        </DndContext>
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
                                    {categories.filter(c => hasAccess(c._id)).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            {/* SubCategory Form Content */}
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
                                    {subImage && <Image src={subImage} alt="Preview" width={64} height={64} className="rounded object-cover" unoptimized />}
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
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNoteDragEnd}>
                                <SortableContext items={[...notes].sort((a, b) => a.rank - b.rank).map(n => n._id)} strategy={verticalListSortingStrategy}>
                                    <div className="rounded-md border bg-card">
                                        {[...notes].sort((a, b) => a.rank - b.rank).map((note) => (
                                            <SortableNoteItem key={note._id} note={note} canManage={hasNoteAccess(note)} onEdit={(n) => { setEditingNoteData(n); setIsEditingNote(true); }} onDelete={handleDeleteNote} />
                                        ))}
                                        {notes.length === 0 && <p className="p-4 text-center text-muted-foreground">No notes yet.</p>}
                                    </div>
                                </SortableContext>
                            </DndContext>
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
