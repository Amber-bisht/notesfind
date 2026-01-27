"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Download, User, Settings, FileText, Github, Linkedin, Twitter, Globe, Code } from "lucide-react";
import { NoteForm } from "@/components/NoteForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [notes, setNotes] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("downloads");
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userRes = await fetch('/api/auth/me');
            const userData = await userRes.json();

            if (!userData.user) {
                // Redirect or show login
                return;
            }
            setUser(userData.user);

            // If publisher/admin, fetch their created notes
            if (['admin', 'publisher'].includes(userData.user.role)) {
                let url = '/api/notes';
                const res = await fetch(url);
                const data = await res.json();
                const allNotes = data.notes || [];

                if (userData.user.role === 'admin') {
                    setNotes(allNotes);
                } else {
                    setNotes(allNotes.filter((n: any) => n.authorId?.email === userData.user.email));
                }
                setActiveTab("mynotes"); // Default to my notes for creators
            } else {
                setActiveTab("downloads"); // Default to downloads for regular users
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

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
        if (res.ok) fetchData();
    }

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
    if (!user) return <div className="p-8 text-center">Please log in to view dashboard.</div>;

    const canCreate = ['admin', 'publisher'].includes(user.role);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user.name}</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b">
                {canCreate && (
                    <button
                        onClick={() => setActiveTab("mynotes")}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "mynotes"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <FileText className="w-4 h-4" /> My Notes
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("downloads")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "downloads"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Download className="w-4 h-4" /> Downloads
                </button>
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "profile"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <User className="w-4 h-4" /> Profile
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "mynotes" && canCreate && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={handleCreate} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
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
                                    onSuccess={() => { setIsCreating(false); fetchData(); }}
                                    onCancel={() => setIsCreating(false)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map(note => (
                                    <div key={note._id} className="border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all duration-300 group relative flex flex-col">
                                        {/* Image Section */}
                                        {note.images && note.images[0] && (
                                            <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                                <img
                                                    src={note.images[0]}
                                                    alt={note.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}

                                        <div className="p-6 space-y-4 flex-1 flex flex-col">
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{note.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{note.subCategoryId?.name}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 pt-4 border-t mt-auto">
                                                <button onClick={() => handleEdit(note)} className="p-2 hover:bg-muted rounded-md transition-colors" title="Edit">
                                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                                <button onClick={() => handleDelete(note._id)} className="p-2 hover:bg-destructive/10 rounded-md transition-colors group/del" title="Delete">
                                                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover/del:text-destructive" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                                        You haven't created any notes yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "downloads" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.downloads && user.downloads.length > 0 ? (
                                user.downloads.map((item: any, index: number) => {
                                    const note = item.noteId;
                                    if (!note) return null; // Handle deleted notes
                                    return (
                                        <div key={`${note._id}-${index}`} className="group overflow-hidden border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                                            <div className="aspect-video bg-muted relative overflow-hidden">
                                                {note.images && note.images[0] ? (
                                                    <img src={note.images[0]} alt={note.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        <FileText className="w-12 h-12 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Link
                                                        href={`/${note.subCategoryId?.categoryId?.slug}/${note.subCategoryId?.slug}/${note.slug}`}
                                                        className="px-4 py-2 bg-white text-black rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-all"
                                                    >
                                                        View Note
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg mb-2 line-clamp-1">{note.title}</h3>
                                                <div className="flex items-center text-xs text-muted-foreground justify-between">
                                                    <span>Downloaded {new Date(item.downloadedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                                    <div className="flex flex-col items-center gap-2">
                                        <Download className="w-10 h-10 opacity-20" />
                                        <p>You haven't downloaded any notes yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="max-w-2xl mx-auto border rounded-xl bg-card p-8">
                        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                        <ProfileForm initialSocials={user.socials} onUpdate={fetchData} />
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileForm({ initialSocials, onUpdate }: { initialSocials: any, onUpdate: () => void }) {
    const [socials, setSocials] = useState(initialSocials || {});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socials })
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
                onUpdate();
            } else {
                setMessage("Failed to update profile.");
            }
        } catch (error) {
            setMessage("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Github className="w-4 h-4" /> GitHub
                    </label>
                    <input
                        type="url"
                        name="github"
                        value={socials.github || ""}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="https://github.com/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Twitter className="w-4 h-4" /> X (Twitter)
                    </label>
                    <input
                        type="url"
                        name="twitter"
                        value={socials.twitter || ""}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://x.com/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                    </label>
                    <input
                        type="url"
                        name="linkedin"
                        value={socials.linkedin || ""}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://linkedin.com/in/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Code className="w-4 h-4" /> LeetCode
                    </label>
                    <input
                        type="url"
                        name="leetcode"
                        value={socials.leetcode || ""}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://leetcode.com/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Code className="w-4 h-4" /> Codeforces
                    </label>
                    <input
                        type="url"
                        name="codeforces"
                        value={socials.codeforces || ""}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://codeforces.com/profile/username"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Website
                    </label>
                    <input
                        type="url"
                        name="website"
                        value={socials.website || ""}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="https://yourwebsite.com"
                    />
                </div>
            </div>

            {message && <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

            <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors"
            >
                {saving ? "Saving..." : "Save Profile"}
            </button>
        </form>
    );
}
