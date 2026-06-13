"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Download, User, FileText, Github, Linkedin, Twitter, Globe, Code, MapPin, LogOut, ExternalLink, Phone, X as XIcon } from "lucide-react";
import { NoteForm } from "@/components/NoteForm";
import Link from "next/link";
import Image from "next/image";

// Define interfaces matching API response (where dates are strings)
interface DashboardNote {
    _id: string;
    title: string;
    slug: string;
    content: string;
    subCategoryId?: { 
        name: string; 
        slug: string;
        categoryId?: { slug: string; name: string }
    };
    authorId?: { name: string; email: string; image?: string };
    images: string[];
    createdAt: string;
}

interface DashboardUser {
    name: string;
    email: string;
    role: string;
    image?: string;
    phone?: string;
    downloads: {
        noteId: DashboardNote | null; // Populated note or null if deleted
        downloadedAt: string;
    }[];
    socials: {
        github?: string;
        twitter?: string;
        linkedin?: string;
        leetcode?: string;
        codeforces?: string;
        website?: string;
        [key: string]: string | undefined;
    };
    joinedWebinars: {
        webinarId: {
            _id: string;
            title: string;
            image?: string;
            timestamp: string;
            type: 'offline' | 'online';
            venue?: string;
            address?: string;
            description?: string;
            link?: string;
            mapLink?: string;
        } | null;
        joinedAt: string;
    }[];
}

export default function DashboardPage() {
    const [user, setUser] = useState<DashboardUser | null>(null);
    const [notes, setNotes] = useState<DashboardNote[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<DashboardNote | null>(null);
    const [activeTab, setActiveTab] = useState("downloads");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Basic Session
            const userRes = await fetch('/api/auth/me');
            const userData = await userRes.json();

            if (!userData.user) {
                setLoading(false);
                return;
            }

            // 2. Fetch Heavy Activity Data (Downloads, Socials, etc.)
            const activityRes = await fetch('/api/user/activity');
            const activityData = await activityRes.json();

            // Merge session + activity
            const fullUser = {
                ...userData.user,
                ...activityData
            };
            setUser(fullUser);

            // 3. If publisher/admin, fetch their created notes
            if (['owner', 'co_owner', 'publisher'].includes(fullUser.role)) {
                const res = await fetch('/api/notes');
                const data = await res.json();
                const allNotes = data.notes || [];

                if (fullUser.role === 'owner' || fullUser.role === 'co_owner') {
                    setNotes(allNotes as DashboardNote[]);
                } else {
                    setNotes((allNotes as DashboardNote[]).filter((n: any) => n.authorId?.email === fullUser.email));
                }
                setActiveTab("mynotes");
            } else {
                setActiveTab("downloads");
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

    const handleEdit = (note: DashboardNote) => {
        setEditingNote(note);
        setIsCreating(true);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
    }

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-pulse mt-8 px-4 md:px-0">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted"></div>
                    <div className="space-y-3">
                        <div className="h-8 w-48 bg-muted rounded-md"></div>
                        <div className="h-4 w-64 bg-muted rounded-md"></div>
                    </div>
                </div>
                <div className="h-10 w-24 bg-muted rounded-xl"></div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex border-b gap-4 pb-0">
                <div className="h-12 w-32 bg-muted rounded-t-md"></div>
                <div className="h-12 w-32 bg-muted rounded-t-md"></div>
                <div className="h-12 w-32 bg-muted rounded-t-md"></div>
                <div className="h-12 w-32 bg-muted rounded-t-md hidden md:block"></div>
            </div>

            {/* Content Skeleton (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border rounded-xl bg-card overflow-hidden h-[320px] flex flex-col">
                        <div className="aspect-video w-full bg-muted"></div>
                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="h-6 w-3/4 bg-muted rounded-md"></div>
                                <div className="h-4 w-1/2 bg-muted rounded-md"></div>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-md mt-auto opacity-50"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!user) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                    <User className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold">Please log in</h1>
                <p className="text-muted-foreground">You need to be authenticated to view your dashboard.</p>
                <Link href="/auth" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity">
                    Login Now
                </Link>
            </div>
        </div>
    );

    const canCreate = ['owner', 'co_owner', 'publisher'].includes(user.role);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-4">
                    {user.image ? (
                        <Image src={user.image} alt={user.name} width={64} height={64} className="w-16 h-16 rounded-full border-2 border-primary/20" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary border-2 border-primary/20">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{user.name}&apos;s Dashboard</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <span className="capitalize px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                {user.role}
                            </span>
                            • {user.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
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
                <button
                    onClick={() => setActiveTab("webinars")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "webinars"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Globe className="w-4 h-4" /> Webinars
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
                                                <Image
                                                    src={note.images[0]}
                                                    alt={note.title}
                                                    width={400}
                                                    height={225}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}

                                        <div className="p-6 space-y-4 flex-1 flex flex-col">
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                        <Link href={`/${note.subCategoryId?.slug}/${note.slug}`}>
                                                            {note.title}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{note.subCategoryId?.name}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {(() => {
                                                        const cleanText = note.content
                                                            .replace(/[#*`_~]/g, '')
                                                            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                                                            .replace(/<[^>]*>/g, '')
                                                            .replace(/!\[[^\]]*\]\([^)]+\)/g, '');
                                                        return cleanText.length > 160 ? cleanText.substring(0, 160) + '...' : cleanText;
                                                    })()}
                                                </p>
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
                                        You haven&apos;t created any notes yet.
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
                                user.downloads.map((item, index: number) => {
                                    const note = item.noteId;
                                    if (!note) return null; // Handle deleted notes
                                    return (
                                        <div key={`${note._id}-${index}`} className="group overflow-hidden border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                                            <div className="aspect-video bg-muted relative overflow-hidden">
                                                {note.images && note.images[0] ? (
                                                    <Image src={note.images[0]} alt={note.title} width={400} height={225} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        <FileText className="w-12 h-12 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Link
                                                        href={`/${note.subCategoryId?.slug}/${note.slug}`}
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
                                        <p>You haven&apos;t downloaded any notes yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="max-w-2xl mx-auto border rounded-xl bg-card p-8">
                        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                        <ProfileForm initialSocials={user.socials} initialPhone={user.phone} onUpdate={fetchData} />
                    </div>
                )}

                {activeTab === "webinars" && (
                    <WebinarsTab user={user} />
                )}
            </div>
        </div>
    );
}

function WebinarsTab({ user }: { user: DashboardUser }) {
    const joinedWebinars = user.joinedWebinars || [];

    if (joinedWebinars.length === 0) {
        return (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <div className="flex flex-col items-center gap-2">
                    <Globe className="w-10 h-10 opacity-20" />
                    <p>You haven&apos;t joined any webinars yet.</p>
                    <Link href="/webinars" className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                        Explore Webinars
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Your Scheduled Webinars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedWebinars.map((jw) => {
                    const webinar = jw.webinarId;
                    if (!webinar) return null;

                    return (
                        <div key={webinar._id} className="border rounded-xl bg-card overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group relative">
                            <div className="aspect-video bg-muted relative overflow-hidden">
                                {webinar.image ? (
                                    <Image src={webinar.image} alt={webinar.title} width={400} height={225} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-primary/10 text-primary">
                                        Webinar
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {new Date(webinar.timestamp).toLocaleDateString()}
                                </div>
                                <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded uppercase font-bold tracking-wider ${webinar.type === 'offline' ? 'bg-orange-500/90' : 'bg-blue-500/90'
                                    }`}>
                                    {webinar.type === 'offline' ? 'Offline' : 'Online'}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-2 line-clamp-1">{webinar.title}</h3>
                                <div className="mb-4">
                                    {webinar.type === 'offline' ? (
                                        <div className="text-sm text-muted-foreground flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-foreground">{webinar.venue}</p>
                                                <p>{webinar.address}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground line-clamp-3">{webinar.description}</p>
                                    )}
                                </div>

                                <div className="mt-auto space-y-2">
                                    <Link href={`/webinars/${webinar._id}`} className="block w-full text-center py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80">
                                        View Details
                                    </Link>

                                    {webinar.type === 'online' && webinar.link && (
                                        <a
                                            href={webinar.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                                        >
                                            Enter Room
                                        </a>
                                    )}
                                    {webinar.type === 'offline' && webinar.mapLink && (
                                        <a
                                            href={webinar.mapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex w-full items-center justify-center py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Get Directions
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Country dial codes list (common ones)
const COUNTRY_CODES = [
    { code: "+1", country: "US/CA" },
    { code: "+7", country: "RU" },
    { code: "+20", country: "EG" },
    { code: "+27", country: "ZA" },
    { code: "+30", country: "GR" },
    { code: "+31", country: "NL" },
    { code: "+32", country: "BE" },
    { code: "+33", country: "FR" },
    { code: "+34", country: "ES" },
    { code: "+36", country: "HU" },
    { code: "+39", country: "IT" },
    { code: "+40", country: "RO" },
    { code: "+41", country: "CH" },
    { code: "+43", country: "AT" },
    { code: "+44", country: "GB" },
    { code: "+45", country: "DK" },
    { code: "+46", country: "SE" },
    { code: "+47", country: "NO" },
    { code: "+48", country: "PL" },
    { code: "+49", country: "DE" },
    { code: "+51", country: "PE" },
    { code: "+52", country: "MX" },
    { code: "+53", country: "CU" },
    { code: "+54", country: "AR" },
    { code: "+55", country: "BR" },
    { code: "+56", country: "CL" },
    { code: "+57", country: "CO" },
    { code: "+58", country: "VE" },
    { code: "+60", country: "MY" },
    { code: "+61", country: "AU" },
    { code: "+62", country: "ID" },
    { code: "+63", country: "PH" },
    { code: "+64", country: "NZ" },
    { code: "+65", country: "SG" },
    { code: "+66", country: "TH" },
    { code: "+81", country: "JP" },
    { code: "+82", country: "KR" },
    { code: "+84", country: "VN" },
    { code: "+86", country: "CN" },
    { code: "+90", country: "TR" },
    { code: "+91", country: "IN" },
    { code: "+92", country: "PK" },
    { code: "+93", country: "AF" },
    { code: "+94", country: "LK" },
    { code: "+95", country: "MM" },
    { code: "+98", country: "IR" },
    { code: "+212", country: "MA" },
    { code: "+213", country: "DZ" },
    { code: "+216", country: "TN" },
    { code: "+218", country: "LY" },
    { code: "+220", country: "GM" },
    { code: "+221", country: "SN" },
    { code: "+223", country: "ML" },
    { code: "+225", country: "CI" },
    { code: "+227", country: "NE" },
    { code: "+228", country: "TG" },
    { code: "+229", country: "BJ" },
    { code: "+230", country: "MU" },
    { code: "+231", country: "LR" },
    { code: "+232", country: "SL" },
    { code: "+233", country: "GH" },
    { code: "+234", country: "NG" },
    { code: "+235", country: "TD" },
    { code: "+236", country: "CF" },
    { code: "+237", country: "CM" },
    { code: "+238", country: "CV" },
    { code: "+239", country: "ST" },
    { code: "+240", country: "GQ" },
    { code: "+241", country: "GA" },
    { code: "+242", country: "CG" },
    { code: "+243", country: "CD" },
    { code: "+244", country: "AO" },
    { code: "+245", country: "GW" },
    { code: "+246", country: "IO" },
    { code: "+247", country: "AC" },
    { code: "+248", country: "SC" },
    { code: "+249", country: "SD" },
    { code: "+250", country: "RW" },
    { code: "+251", country: "ET" },
    { code: "+252", country: "SO" },
    { code: "+253", country: "DJ" },
    { code: "+254", country: "KE" },
    { code: "+255", country: "TZ" },
    { code: "+256", country: "UG" },
    { code: "+257", country: "BI" },
    { code: "+258", country: "MZ" },
    { code: "+260", country: "ZM" },
    { code: "+261", country: "MG" },
    { code: "+262", country: "RE" },
    { code: "+263", country: "ZW" },
    { code: "+264", country: "NA" },
    { code: "+265", country: "MW" },
    { code: "+266", country: "LS" },
    { code: "+267", country: "BW" },
    { code: "+268", country: "SZ" },
    { code: "+269", country: "KM" },
    { code: "+290", country: "SH" },
    { code: "+291", country: "ER" },
    { code: "+297", country: "AW" },
    { code: "+298", country: "FO" },
    { code: "+299", country: "GL" },
    { code: "+350", country: "GI" },
    { code: "+351", country: "PT" },
    { code: "+352", country: "LU" },
    { code: "+353", country: "IE" },
    { code: "+354", country: "IS" },
    { code: "+355", country: "AL" },
    { code: "+356", country: "MT" },
    { code: "+357", country: "CY" },
    { code: "+358", country: "FI" },
    { code: "+359", country: "BG" },
    { code: "+370", country: "LT" },
    { code: "+371", country: "LV" },
    { code: "+372", country: "EE" },
    { code: "+373", country: "MD" },
    { code: "+374", country: "AM" },
    { code: "+375", country: "BY" },
    { code: "+376", country: "AD" },
    { code: "+377", country: "MC" },
    { code: "+378", country: "SM" },
    { code: "+380", country: "UA" },
    { code: "+381", country: "RS" },
    { code: "+382", country: "ME" },
    { code: "+385", country: "HR" },
    { code: "+386", country: "SI" },
    { code: "+387", country: "BA" },
    { code: "+389", country: "MK" },
    { code: "+420", country: "CZ" },
    { code: "+421", country: "SK" },
    { code: "+423", country: "LI" },
    { code: "+500", country: "FK" },
    { code: "+501", country: "BZ" },
    { code: "+502", country: "GT" },
    { code: "+503", country: "SV" },
    { code: "+504", country: "HN" },
    { code: "+505", country: "NI" },
    { code: "+506", country: "CR" },
    { code: "+507", country: "PA" },
    { code: "+508", country: "PM" },
    { code: "+509", country: "HT" },
    { code: "+590", country: "GP" },
    { code: "+591", country: "BO" },
    { code: "+592", country: "GY" },
    { code: "+593", country: "EC" },
    { code: "+594", country: "GF" },
    { code: "+595", country: "PY" },
    { code: "+596", country: "MQ" },
    { code: "+597", country: "SR" },
    { code: "+598", country: "UY" },
    { code: "+599", country: "AN" },
    { code: "+670", country: "TL" },
    { code: "+672", country: "NF" },
    { code: "+673", country: "BN" },
    { code: "+674", country: "NR" },
    { code: "+675", country: "PG" },
    { code: "+676", country: "TO" },
    { code: "+677", country: "SB" },
    { code: "+678", country: "VU" },
    { code: "+679", country: "FJ" },
    { code: "+680", country: "PW" },
    { code: "+681", country: "WF" },
    { code: "+682", country: "CK" },
    { code: "+683", country: "NU" },
    { code: "+685", country: "WS" },
    { code: "+686", country: "KI" },
    { code: "+687", country: "NC" },
    { code: "+688", country: "TV" },
    { code: "+689", country: "PF" },
    { code: "+690", country: "TK" },
    { code: "+691", country: "FM" },
    { code: "+692", country: "MH" },
    { code: "+850", country: "KP" },
    { code: "+852", country: "HK" },
    { code: "+853", country: "MO" },
    { code: "+855", country: "KH" },
    { code: "+856", country: "LA" },
    { code: "+880", country: "BD" },
    { code: "+886", country: "TW" },
    { code: "+960", country: "MV" },
    { code: "+961", country: "LB" },
    { code: "+962", country: "JO" },
    { code: "+963", country: "SY" },
    { code: "+964", country: "IQ" },
    { code: "+965", country: "KW" },
    { code: "+966", country: "SA" },
    { code: "+967", country: "YE" },
    { code: "+968", country: "OM" },
    { code: "+970", country: "PS" },
    { code: "+971", country: "AE" },
    { code: "+972", country: "IL" },
    { code: "+973", country: "BH" },
    { code: "+974", country: "QA" },
    { code: "+975", country: "BT" },
    { code: "+976", country: "MN" },
    { code: "+977", country: "NP" },
    { code: "+992", country: "TJ" },
    { code: "+993", country: "TM" },
    { code: "+994", country: "AZ" },
    { code: "+995", country: "GE" },
    { code: "+996", country: "KG" },
    { code: "+998", country: "UZ" },
];

// Helper: parse stored phone into { countryCode, number }
function parsePhone(stored: string): { countryCode: string; number: string } {
    if (!stored) return { countryCode: "+91", number: "" };
    // Try to match a known country code prefix
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const { code } of sorted) {
        if (stored.startsWith(code)) {
            return { countryCode: code, number: stored.slice(code.length).trim() };
        }
    }
    return { countryCode: "+91", number: stored };
}

// Helper: extract username from a full URL or return as-is
function extractUsername(value: string, platform: string): string {
    if (!value) return "";
    try {
        const url = new URL(value.startsWith("http") ? value : `https://${value}`);
        const parts = url.pathname.split("/").filter(Boolean);
        if (platform === "linkedin") {
            // linkedin.com/in/username
            const inIdx = parts.indexOf("in");
            return inIdx !== -1 && parts[inIdx + 1] ? parts[inIdx + 1] : parts[parts.length - 1] || value;
        }
        if (platform === "codeforces") {
            // codeforces.com/profile/username
            const pIdx = parts.indexOf("profile");
            return pIdx !== -1 && parts[pIdx + 1] ? parts[pIdx + 1] : parts[parts.length - 1] || value;
        }
        return parts[parts.length - 1] || value;
    } catch {
        return value;
    }
}

const SOCIAL_PLATFORMS: { key: string; label: string; icon: React.ReactNode; prefix: string; placeholder: string }[] = [
    { key: "github",     label: "GitHub",     icon: <Github className="w-4 h-4" />,   prefix: "github.com/",                 placeholder: "yourusername" },
    { key: "twitter",   label: "X (Twitter)", icon: <Twitter className="w-4 h-4" />,  prefix: "x.com/",                     placeholder: "yourusername" },
    { key: "linkedin",  label: "LinkedIn",    icon: <Linkedin className="w-4 h-4" />, prefix: "linkedin.com/in/",           placeholder: "yourusername" },
    { key: "leetcode",  label: "LeetCode",    icon: <Code className="w-4 h-4" />,     prefix: "leetcode.com/u/",            placeholder: "yourusername" },
    { key: "codeforces",label: "Codeforces",  icon: <Code className="w-4 h-4" />,     prefix: "codeforces.com/profile/",    placeholder: "yourusername" },
];

// Build the full URL for a social platform username
function buildSocialUrl(key: string, username: string): string {
    if (!username) return "";
    const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
    if (!platform) return username;
    return `https://${platform.prefix}${username}`;
}

function ProfileForm({ initialSocials, initialPhone, onUpdate }: { initialSocials: DashboardUser['socials'], initialPhone?: string, onUpdate: () => void }) {
    // Parse stored usernames (may be stored as full URLs from before — normalise on load)
    const parseInitialSocials = (raw: DashboardUser['socials']) => {
        const out: Record<string, string> = {};
        SOCIAL_PLATFORMS.forEach(({ key }) => {
            const platform = key as "github" | "twitter" | "linkedin" | "leetcode" | "codeforces";
            out[key] = extractUsername(raw?.[platform] || "", key);
        });
        out.website = raw?.website || "";
        return out;
    };

    const parsed = parsePhone(initialPhone || "");
    const [isEditing, setIsEditing] = useState(false);
    const [countryCode, setCountryCode] = useState(parsed.countryCode);
    const [phoneNumber, setPhoneNumber] = useState(parsed.number);
    const [socials, setSocials] = useState(() => parseInitialSocials(initialSocials || {}));
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Reset draft state to current saved values when entering edit mode
    const handleEdit = () => {
        setMessage("");
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Restore to initial values
        const p = parsePhone(initialPhone || "");
        setCountryCode(p.countryCode);
        setPhoneNumber(p.number);
        setSocials(parseInitialSocials(initialSocials || {}));
        setMessage("");
        setIsEditing(false);
    };

    const handleSocialChange = (key: string, value: string) => {
        const clean = value.replace(/^@/, "");
        setSocials(prev => ({ ...prev, [key]: clean }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const mergedPhone = phoneNumber.trim() ? `${countryCode} ${phoneNumber.trim()}` : "";

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socials, phone: mergedPhone })
            });

            if (res.ok) {
                setMessage("Profile updated successfully!");
                setIsEditing(false);
                onUpdate();
            } else {
                setMessage("Failed to update profile.");
            }
        } catch {
            setMessage("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    /* ── VIEW MODE ── */
    if (!isEditing) {
        const displayPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : null;
        const hasSocials = SOCIAL_PLATFORMS.some(p => socials[p.key]) || socials.website;

        return (
            <div className="space-y-6">
                {/* Header row */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Info</h3>
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                </div>

                {message && (
                    <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>{message}</p>
                )}

                {/* Phone */}
                <div className="flex items-center gap-3 py-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                        <p className="text-sm font-medium">
                            {displayPhone || <span className="text-muted-foreground italic">Not set</span>}
                        </p>
                    </div>
                </div>

                {/* Socials */}
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Social Links</p>
                    {!hasSocials && (
                        <p className="text-sm text-muted-foreground italic py-2">No social links added yet.</p>
                    )}
                    {SOCIAL_PLATFORMS.map(({ key, label, icon, prefix }) => {
                        const username = socials[key];
                        if (!username) return null;
                        const url = buildSocialUrl(key, username);
                        return (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted transition-colors group"
                            >
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium truncate">
                                        <span className="text-muted-foreground">{prefix}</span>{username}
                                    </p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </a>
                        );
                    })}
                    {socials.website && (
                        <a
                            href={socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors"><Globe className="w-4 h-4" /></span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Website</p>
                                <p className="text-sm font-medium truncate">{socials.website.replace(/^https?:\/\//, "")}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                    )}
                </div>
            </div>
        );
    }

    /* ── EDIT MODE ── */
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Edit Profile</h3>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-input hover:bg-muted transition-colors"
                >
                    <XIcon className="w-3.5 h-3.5" /> Cancel
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* Phone: country code + number */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="flex gap-2">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{ minWidth: "110px" }}
                        >
                            {COUNTRY_CODES.map(({ code, country }) => (
                                <option key={`${code}-${country}`} value={code}>
                                    {code} {country}
                                </option>
                            ))}
                        </select>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s\-]/g, ""))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="98765 43210"
                        />
                    </div>
                </div>

                {/* Username-only social fields */}
                {SOCIAL_PLATFORMS.map(({ key, label, icon, prefix, placeholder }) => (
                    <div key={key} className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            {icon} {label}
                        </label>
                        <div className="flex items-center rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                            <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r border-input whitespace-nowrap select-none">
                                {prefix}
                            </span>
                            <input
                                type="text"
                                name={key}
                                value={socials[key] || ""}
                                onChange={(e) => handleSocialChange(key, e.target.value)}
                                className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
                                placeholder={placeholder}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                ))}

                {/* Website: full URL */}
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Website
                    </label>
                    <div className="flex items-center rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                        <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r border-input whitespace-nowrap select-none">
                            https://
                        </span>
                        <input
                            type="text"
                            name="website"
                            value={(socials.website || "").replace(/^https?:\/\//, "")}
                            onChange={(e) => setSocials(prev => ({ ...prev, website: e.target.value ? `https://${e.target.value.replace(/^https?:\/\//, "")}` : "" }))}
                            className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
                            placeholder="yourwebsite.com"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>
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
