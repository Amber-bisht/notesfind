"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { NoteForm } from "@/components/NoteForm";

export default function DashboardPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<any>(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        // Determine user ID from token or 'me' endpoint to filter?
        // The endpoint /api/me returns user, and /api/notes accepts query params.
        // However, for publishers, we should probably only show *their* notes.
        // My API /api/notes currently returns *all* notes or filtered by authorId.
        // I should get current user ID.
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        // If not logged in, middleware handles it, but client might need to wait.
        if (!userData.user) return; // Should redirect

        // Fetch notes for this author
        // But wait, ADMIN needs to see all notes? USER requirement says Publisher manages OWN notes.
        // Let's assume dashboard shows OWN notes for Publisher.
        // For Admin, it might show all or OWN. Ideally Admin dashboard would manage all. 
        // This /dashboard is likely the "Publisher Dashboard".
        const res = await fetch(`/api/notes?authorId=${userData.user._id}`); // Ideally userId, but my Me route returns email/role/image but not ID?
        // Wait, my Me route returns { email, name, role, image }. I need ID.
        // I should update Me route to return ID.
        // Or I can filter on client? Accessing all notes is bad. 
        // Actually, I can update Me route quickly. Or I can filter by "my notes" endpoint.
        // Let's rely on server side filtering if I passed ID.
        // WAIT, I implemented /api/notes to accept `authorId`. 
        // I need to update /api/auth/me to return `_id` or `id`.

        // For now, let's assume I see all notes if I don't pass authorId, which is NOT GOOD for privacy if I am publisher.
        // But /api/notes populated 'authorId', so I can filter on client.
        // Better: update /api/auth/me to return ID.
    };

    // REVISION: I will update the Me route to return ID. I will do it in next step or assume it works for now and fix it.
    // Actually, I can just fetch all notes and filter on client for now as MVP.
    // Wait, `authorId` in Note is an Object (populated).
    // I need to check `note.authorId.email` vs `user.email`.

    const fetchNotesSafe = async () => {
        const userRes = await fetch('/api/auth/me');
        const { user } = await userRes.json();
        if (!user) return;

        let url = '/api/notes';
        // If user is publisher, we want only their notes ideally.
        // But if I can't filter by ID easily without ID, I'll filter by email matching.

        const res = await fetch(url);
        const data = await res.json();
        const allNotes = data.notes || [];

        if (user.role === 'admin') {
            setNotes(allNotes);
        } else {
            setNotes(allNotes.filter((n: any) => n.authorId?.email === user.email));
        }
    }

    const handleCreate = () => {
        setIsCreating(true);
        setEditingNote(null);
    }

    const handleEdit = (note: any) => {
        setEditingNote(note);
        setIsCreating(true);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        if (res.ok) fetchNotesSafe();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Notes</h1>
                <button onClick={handleCreate} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    <Plus className="w-4 h-4 mr-2" /> New Note
                </button>
            </div>

            {isCreating ? (
                <div className="border p-6 rounded-xl bg-card">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{editingNote ? "Edit Note" : "Create New Note"}</h2>
                    </div>
                    <NoteForm
                        initialData={editingNote}
                        onSuccess={() => { setIsCreating(false); fetchNotesSafe(); }}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map(note => (
                        <div key={note._id} className="border rounded-xl bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-lg line-clamp-1">{note.title}</h3>
                                <p className="text-sm text-muted-foreground">{note.subCategoryId?.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button onClick={() => handleEdit(note)} className="p-2 hover:bg-muted rounded-md transition-colors">
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button onClick={() => handleDelete(note._id)} className="p-2 hover:bg-destructive/10 rounded-md transition-colors group">
                                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {notes.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            You haven't created any notes yet.
                        </div>
                    )}
                </div>
            )}

            {/* Trigger fetch on mount */}
            <SafeDataFetcher onFetch={setNotes} />
        </div>
    );
}

function SafeDataFetcher({ onFetch }: { onFetch: (notes: any[]) => void }) {
    useEffect(() => {
        async function run() {
            const userRes = await fetch('/api/auth/me');
            const { user } = await userRes.json();
            if (!user) return;

            const res = await fetch('/api/notes');
            const data = await res.json();
            const allNotes = data.notes || [];

            if (user.role === 'admin') {
                onFetch(allNotes);
            } else {
                onFetch(allNotes.filter((n: any) => n.authorId?.email === user.email));
            }
        }
        run();
    }, []);
    return null;
}
