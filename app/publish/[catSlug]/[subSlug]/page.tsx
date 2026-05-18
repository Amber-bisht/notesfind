"use client";

import { useState, useEffect, use } from "react";
import { Plus, Trash2, Pencil, X, Lock, GripVertical, ExternalLink, ArrowLeft, FileText } from "lucide-react";
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

import { NoteForm } from "@/components/NoteForm";

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
function SortableNoteItem({ note, canManage, onEdit, onDelete }: { note: any; canManage: boolean; onEdit: (note: any) => void; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note._id, disabled: !canManage });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 mb-3 rounded-xl border bg-card hover:border-primary/50 transition-all shadow-sm ${!canManage ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 overflow-hidden flex-1">
                {canManage && (
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded touch-none shrink-0">
                        <GripVertical className="w-5 h-5" />
                    </button>
                )}
                <a href={`/${note.subCategoryId?.slug || 'sub'}/${note.slug}`} target="_blank" className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                    {note.images?.[0] ? <Image src={note.images[0]} alt={note.title} width={48} height={48} className="w-full h-full object-cover" unoptimized /> : <FileText className="w-6 h-6 text-muted-foreground" />}
                </a>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate flex items-center gap-2">
                        {note.title}
                        {!canManage && <Lock className="w-4 h-4 text-red-500 shrink-0" />}
                    </h3>
                    <a href={`/${note.subCategoryId?.slug || 'sub'}/${note.slug}`} target="_blank" className="text-sm text-muted-foreground hover:text-primary hover:underline truncate flex items-center gap-1 mt-1 w-fit">
                        /{note.subCategoryId?.slug || '...'}/{note.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
                {canManage && (
                    <>
                        <button onClick={() => onEdit(note)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded transition-colors">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(note._id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PublishNotesPage({ params }: { params: Promise<{ catSlug: string, subSlug: string }> }) {
    const { catSlug, subSlug } = use(params);
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [notes, setNotes] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subCategory, setSubCategory] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNoteData, setEditingNoteData] = useState<any>(null);

    useEffect(() => {
        fetchData();
        fetchUser();
    }, [catSlug, subSlug]);

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
        const subRes = await fetch("/api/subcategories");
        const subData = await subRes.json();
        
        // Find the specific subcategory that matches the slug and whose parent matches catSlug
        const sub = subData.subCategories?.find((s: any) => s.slug === subSlug && (s.categoryId?.slug === catSlug || s.categoryId === catSlug)); // eslint-disable-line @typescript-eslint/no-explicit-any
        
        if (!sub) {
            router.push(`/publish/${catSlug}`);
            return;
        }
        setSubCategory(sub);

        const notesRes = await fetch(`/api/notes?subCategoryId=${sub._id}`);
        const notesData = await notesRes.json();
        setNotes(notesData.notes || []);
    };

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
        fetchData(); // refresh from server
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const sortedNotes = [...notes].sort((a, b) => a.rank - b.rank);

    if (!subCategory) return <div className="p-8 text-center">Loading...</div>;

    const canManageNotes = hasAccess(subCategory.categoryId?._id || subCategory.categoryId);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--primary) / 0.3); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--primary) / 0.5); }
            `}} />
            
            <Link href={`/publish/${catSlug}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 shrink-0">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sub-categories
            </Link>

            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{subCategory.name} <span className="text-muted-foreground font-normal ml-2">Notes</span></h1>
                    <p className="text-muted-foreground">Manage notes under /{catSlug}/{subCategory.slug}.</p>
                </div>
                <button 
                    disabled={!canManageNotes}
                    onClick={() => { setEditingNoteData({ subCategoryId: subCategory._id }); setIsNoteModalOpen(true); }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Note
                </button>
            </div>

            <div className="bg-card border rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col mb-4">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pr-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNoteDragEnd}>
                        <SortableContext items={sortedNotes.map(n => n._id)} strategy={verticalListSortingStrategy}>
                            {sortedNotes.map((note) => (
                                <SortableNoteItem 
                                    key={note._id} 
                                    note={note} 
                                    canManage={canManageNotes} 
                                    onEdit={(n) => { setEditingNoteData(n); setIsNoteModalOpen(true); }} 
                                    onDelete={handleDeleteNote} 
                                />
                            ))}
                            {sortedNotes.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    No notes found.<br/>Click 'Create Note' to get started.
                                </div>
                            )}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* MODAL */}
            <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={editingNoteData?._id ? "Edit Note" : "Create Note"}>
                {isNoteModalOpen && (
                    <NoteForm
                        initialData={editingNoteData}
                        onSuccess={() => { setIsNoteModalOpen(false); fetchData(); }}
                        onCancel={() => setIsNoteModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}
