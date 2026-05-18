"use client";

import { useState, useEffect, use } from "react";
import { Plus, Trash2, Pencil, X, Lock, GripVertical, ChevronRight, Folder, ExternalLink, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
function SortableSubItem({ sub, canManage, onEdit, onDelete }: { sub: any; canManage: boolean; onEdit: (sub: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub._id, disabled: !canManage });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 mb-3 rounded-xl border bg-card hover:border-primary/50 transition-all shadow-sm ${!canManage ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 overflow-hidden flex-1">
                {canManage && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded touch-none shrink-0">
                        <GripVertical className="w-5 h-5" />
                    </button>
                )}
                <Link href={`/publish/${sub.categoryId?.slug || 'cat'}/${sub.slug}`} className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                    {sub.image ? <Image src={sub.image} alt={sub.name} width={48} height={48} className="w-full h-full object-cover" unoptimized /> : <Folder className="w-6 h-6 text-muted-foreground" />}
                </Link>
                <div className="min-w-0 flex-1">
                    <Link href={`/publish/${sub.categoryId?.slug || 'cat'}/${sub.slug}`} className="font-semibold text-base truncate flex items-center gap-2 hover:text-primary transition-colors">
                        {sub.name}
                        {!canManage && <Lock className="w-4 h-4 text-red-500 shrink-0" />}
                    </Link>
                    <a href={`/${sub.categoryId?.slug || 'cat'}/${sub.slug}`} target="_blank" className="text-sm text-muted-foreground hover:text-primary hover:underline truncate flex items-center gap-1 mt-1 w-fit">
                        /{sub.categoryId?.slug || '...'}/{sub.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {canManage && (
                    <>
                        <button onClick={() => onEdit(sub)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded transition-colors">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(sub._id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
                <Link href={`/publish/${sub.categoryId?.slug || 'cat'}/${sub.slug}`} className="ml-2 text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </Link>
            </div>
        </div>
    );
}

export default function PublishSubCategoriesPage({ params }: { params: Promise<{ catSlug: string }> }) {
    const { catSlug } = use(params);
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subCategories, setSubCategories] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [category, setCategory] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [subName, setSubName] = useState("");
    const [subSlug, setSubSlug] = useState("");
    const [subDesc, setSubDesc] = useState("");
    const [subImage, setSubImage] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchUser();
    }, [catSlug]);

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

    const fetchData = async () => {
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        const cat = catData.categories?.find((c: any) => c.slug === catSlug); // eslint-disable-line @typescript-eslint/no-explicit-any
        
        if (!cat) {
            router.push('/publish');
            return;
        }
        setCategory(cat);

        const subRes = await fetch(`/api/subcategories?categoryId=${cat._id}`);
        const subData = await subRes.json();
        setSubCategories(subData.subCategories || []);
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

    const resetSubCategoryForm = () => {
        setEditingId(null);
        setSubName("");
        setSubSlug("");
        setSubDesc("");
        setSubImage("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditSubCategory = (sub: any) => {
        setEditingId(sub._id);
        setSubName(sub.name);
        setSubSlug(sub.slug);
        setSubDesc(sub.description || "");
        setSubImage(sub.image || "");
        setIsSubModalOpen(true);
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
        fetchData(); // refresh from server
    };

    const handleSubmitSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextSubRank = editingId
            ? subCategories.find((s: any) => s._id === editingId)?.rank ?? subCategories.length + 1
            : Math.max(0, ...subCategories.map((s: any) => s.rank ?? 0)) + 1;
        const body = { name: subName, slug: subSlug, description: subDesc, rank: nextSubRank, image: subImage, categoryId: category._id };
        const res = await fetch(editingId ? `/api/subcategories/${editingId}` : "/api/subcategories", {
            method: editingId ? "PUT" : "POST",
            body: JSON.stringify(body),
        });
        if (res.ok) {
            resetSubCategoryForm();
            setIsSubModalOpen(false);
            fetchData();
        } else {
            const data = await res.json();
            alert(`Failed to save sub-category: ` + data.error);
        }
    };

    const handleDeleteSubCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const sortedSubCategories = [...subCategories].sort((a, b) => a.rank - b.rank);

    if (!category) return <div className="p-8 text-center">Loading...</div>;

    const canManageCategory = hasAccess(category._id);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--primary) / 0.3); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--primary) / 0.5); }
            `}} />
            
            <Link href="/publish" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 shrink-0">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Categories
            </Link>

            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{category.name} <span className="text-muted-foreground font-normal ml-2">Sub-Categories</span></h1>
                    <p className="text-muted-foreground">Manage sub-categories under /{category.slug}.</p>
                </div>
                <button 
                    disabled={!canManageCategory}
                    onClick={() => { resetSubCategoryForm(); setIsSubModalOpen(true); }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Sub-Category
                </button>
            </div>

            <div className="bg-card border rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col mb-4">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pr-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
                        <SortableContext items={sortedSubCategories.map(s => s._id)} strategy={verticalListSortingStrategy}>
                            {sortedSubCategories.map((sub) => (
                                <SortableSubItem 
                                    key={sub._id} 
                                    sub={sub} 
                                    canManage={canManageCategory} 
                                    onEdit={handleEditSubCategory} 
                                    onDelete={handleDeleteSubCategory} 
                                />
                            ))}
                            {sortedSubCategories.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    No sub-categories found.<br/>Click 'Add Sub-Category' to get started.
                                </div>
                            )}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* MODAL */}
            <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title={editingId ? "Edit Sub-Category" : "Add Sub-Category"}>
                <form onSubmit={handleSubmitSubCategory} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Name</label>
                        <input type="text" value={subName} onChange={(e) => setSubName(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Slug</label>
                        <input type="text" value={subSlug} onChange={(e) => setSubSlug(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Description</label>
                        <textarea value={subDesc} onChange={(e) => setSubDesc(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Image</label>
                        <div className="flex items-center gap-4 mt-2 p-4 border rounded-xl border-dashed">
                            {subImage && <Image src={subImage} alt="Preview" width={64} height={64} className="rounded-lg object-cover" unoptimized />}
                            <input type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const url = await handleUpload(file); if (url) setSubImage(url); } }} className="text-sm" accept="image/*" disabled={uploading} />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsSubModalOpen(false)} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={uploading} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 min-w-[120px]">
                            {uploading ? "Saving..." : (editingId ? "Update" : "Create")}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
