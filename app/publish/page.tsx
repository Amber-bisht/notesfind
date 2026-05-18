"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Lock, GripVertical, ChevronRight, Folder, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 md:p-6 border-b">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableCatItem({ cat, canManage, onEdit, onDelete }: { cat: any; canManage: boolean; onEdit: (cat: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat._id, disabled: !canManage });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 mb-3 rounded-xl border bg-card hover:border-primary/50 transition-all shadow-sm ${!canManage ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 overflow-hidden flex-1">
                {canManage && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded touch-none shrink-0">
                        <GripVertical className="w-5 h-5" />
                    </button>
                )}
                <Link href={`/publish/${cat.slug}`} className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                    {cat.image ? <Image src={cat.image} alt={cat.name} width={48} height={48} className="w-full h-full object-cover" unoptimized /> : <Folder className="w-6 h-6 text-muted-foreground" />}
                </Link>
                <div className="min-w-0 flex-1">
                    <Link href={`/publish/${cat.slug}`} className="font-semibold text-base truncate flex items-center gap-2 hover:text-primary transition-colors">
                        {cat.name}
                        {!canManage && <Lock className="w-4 h-4 text-red-500 shrink-0" />}
                    </Link>
                    <a href={`/${cat.slug}`} target="_blank" className="text-sm text-muted-foreground hover:text-primary hover:underline truncate flex items-center gap-1 mt-1 w-fit">
                        /{cat.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {canManage && (
                    <>
                        <button onClick={() => onEdit(cat)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded transition-colors">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(cat._id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
                <Link href={`/publish/${cat.slug}`} className="ml-2 text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </Link>
            </div>
        </div>
    );
}

export default function PublishCategoriesPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [categories, setCategories] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [catName, setCatName] = useState("");
    const [catSlug, setCatSlug] = useState("");
    const [catDesc, setCatDesc] = useState("");
    const [catImage, setCatImage] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        }
    };

    const hasAccess = (categoryId: string) => {
        if (!user) return false;
        if (user.role === 'owner') return true;
        return user.assignedCategories?.includes(categoryId);
    };

    const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.url;
        } catch (error: any) {
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
        setIsCatModalOpen(true);
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
            ? categories.find((c: any) => c._id === editingId)?.rank ?? categories.length + 1
            : Math.max(0, ...categories.map((c: any) => c.rank ?? 0)) + 1;
        const body: any = { name: catName, slug: catSlug, description: catDesc, rank: nextRank, image: catImage };
        const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
            method: editingId ? "PUT" : "POST",
            body: JSON.stringify(body),
        });
        if (res.ok) {
            resetCategoryForm();
            setIsCatModalOpen(false);
            fetchCategories();
        } else {
            const data = await res.json();
            alert(`Failed to save category: ` + data.error);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) fetchCategories();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const sortedCategories = [...categories].sort((a, b) => a.rank - b.rank);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--primary) / 0.3); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--primary) / 0.5); }
            `}} />
            
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Publishing Studio</h1>
                    <p className="text-muted-foreground">Manage your categories and curriculum.</p>
                </div>
                <button 
                    onClick={() => { resetCategoryForm(); setIsCatModalOpen(true); }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </button>
            </div>

            <div className="bg-card border rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col mb-4">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pr-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                        <SortableContext items={sortedCategories.map(c => c._id)} strategy={verticalListSortingStrategy}>
                            {sortedCategories.map((cat) => (
                                <SortableCatItem 
                                    key={cat._id} 
                                    cat={cat} 
                                    canManage={hasAccess(cat._id)} 
                                    onEdit={handleEditCategory} 
                                    onDelete={handleDeleteCategory} 
                                />
                            ))}
                            {sortedCategories.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    No categories found.<br/>Click 'Add Category' to get started.
                                </div>
                            )}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* MODAL */}
            <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
                <form onSubmit={handleSubmitCategory} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Name</label>
                        <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Slug</label>
                        <input type="text" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Description</label>
                        <textarea value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Image</label>
                        <div className="flex items-center gap-4 mt-2 p-4 border rounded-xl border-dashed">
                            {catImage && <Image src={catImage} alt="Preview" width={64} height={64} className="rounded-lg object-cover" unoptimized />}
                            <input type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await handleUpload(file); if (url) setCatImage(url); } }} className="text-sm" accept="image/*" disabled={uploading} />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={uploading} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 min-w-[120px]">
                            {uploading ? "Saving..." : (editingId ? "Update" : "Create")}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
