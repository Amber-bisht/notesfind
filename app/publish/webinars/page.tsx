"use client";

import { useState, useEffect } from "react";
import { Plus, X, Calendar, Link as LinkIcon, Image as ImageIcon, Unlock, Lock, Globe, MapPin } from "lucide-react";
import Image from "next/image";

export default function WebinarsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [webinars, setWebinars] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [longDescription, setLongDescription] = useState("");
    const [timestamp, setTimestamp] = useState("");
    const [link, setLink] = useState("");
    const [image, setImage] = useState("");
    const [type, setType] = useState("online");
    const [venue, setVenue] = useState("");
    const [address, setAddress] = useState("");
    const [mapLink, setMapLink] = useState("");

    useEffect(() => {
        fetchWebinars();
        fetch('/api/auth/me').then(r => r.json()).then(d => {
            setUser(d.user || null);
            // Auto-select appropriate type based on access
            const access = d.user?.webinarAccess || 'none';
            if (d.user?.role !== 'owner' && access === 'offline') setType('offline');
        }).catch(() => {});
    }, []);

    const fetchWebinars = async () => {
        try {
            const res = await fetch("/api/webinars");
            const data = await res.json();
            setWebinars(data.webinars || []);
        } catch (error) {
            console.error("Failed to fetch webinars", error);
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/webinars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    longDescription,
                    timestamp,
                    link,
                    image,
                    type,
                    venue,
                    address,
                    mapLink
                }),
            });

            if (res.ok) {
                // Reset form
                setTitle("");
                setDescription("");
                setLongDescription("");
                setTimestamp("");
                setLink("");
                setImage("");
                setType("online");
                setVenue("");
                setAddress("");
                setMapLink("");
                fetchWebinars();
            } else {
                const data = await res.json();
                alert("Failed to create webinar: " + data.error);
            }
        } catch (error) {
            console.error("Error creating webinar:", error);
            alert("Error creating webinar");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this webinar?")) return;

        try {
            const res = await fetch(`/api/webinars/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchWebinars();
            } else {
                alert("Failed to delete webinar");
            }
        } catch (error) {
            console.error("Error deleting webinar:", error);
        }
    };

    const handleExport = (id: string) => {
        window.open(`/api/webinars/${id}/export`, '_blank');
    };

    // Access helpers
    const webinarAccess = user?.role === 'owner' ? 'both' : (user?.webinarAccess || 'none');
    const canCreateWebinar = webinarAccess !== 'none';
    const canManageWebinar = (webinarType: string) => {
        if (user?.role === 'owner') return true;
        if (webinarAccess === 'both') return true;
        return webinarAccess === webinarType;
    };
    const allowedTypes: { value: string; label: string }[] = [];
    if (webinarAccess === 'online' || webinarAccess === 'both') allowedTypes.push({ value: 'online', label: 'Online Webinar' });
    if (webinarAccess === 'offline' || webinarAccess === 'both') allowedTypes.push({ value: 'offline', label: 'Offline Event' });

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Webinars Manager</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Existing Webinars</h2>
                    <div className="rounded-md border bg-card">
                        {webinars.map((webinar) => {
                            const canManage = canManageWebinar(webinar.type);
                            return (
                            <div key={webinar._id} className={`p-4 border-b last:border-0 flex gap-4 ${!canManage ? 'opacity-60' : ''}`}>
                                {webinar.image && (
                                    <Image
                                        src={webinar.image}
                                        alt={webinar.title}
                                        width={96}
                                        height={64}
                                        className="rounded object-cover flex-shrink-0"
                                        unoptimized
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate flex items-center gap-2">
                                        {webinar.title}
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            webinar.type === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-600'
                                        }`}>
                                            {webinar.type === 'online' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                            {webinar.type === 'online' ? 'Online' : 'Offline'}
                                        </span>
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
                                    <p className="text-sm text-muted-foreground truncate">{webinar.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(webinar.timestamp).toLocaleString()}
                                        </span>
                                        {webinar.type === 'online' && webinar.link && (
                                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                <LinkIcon className="w-3 h-3" />
                                                {webinar.link}
                                            </span>
                                        )}
                                        {webinar.type === 'offline' && webinar.venue && (
                                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                <MapPin className="w-3 h-3" />
                                                {webinar.venue}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {canManage && (
                                    <div className="flex items-start">
                                        <div className="flex gap-2 mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleExport(webinar._id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                            >
                                                Export CSV
                                            </button>
                                            <button
                                                onClick={() => handleDelete(webinar._id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                        {webinars.length === 0 && (
                            <p className="p-8 text-center text-muted-foreground">No webinars scheduled.</p>
                        )}
                    </div>
                </div>

                {/* Form Section */}
                {canCreateWebinar ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Schedule Webinar</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-card">
                        <div>
                            <label className="text-sm font-medium">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                                placeholder="Weekly Community Call"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Event Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {allowedTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={timestamp}
                                    onChange={(e) => setTimestamp(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {type === 'online' ? (
                            <div>
                                <label className="text-sm font-medium">Link (Zoom/Meet/Discord)</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                    placeholder="https://..."
                                />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium">Venue Name</label>
                                    <input
                                        type="text"
                                        value={venue}
                                        onChange={(e) => setVenue(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                        placeholder="e.g. Grand Convention Center"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Full Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                        placeholder="123 Event St, City, State"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Map Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={mapLink}
                                        onChange={(e) => setMapLink(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-sm font-medium">Short Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                                placeholder="Brief summary for the card..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Detailed Description</label>
                            <textarea
                                value={longDescription}
                                onChange={(e) => setLongDescription(e.target.value)}
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Full details about the event, agenda, speakers..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Cover Image</label>
                            <div className="flex items-center gap-4 mt-2">
                                {image ? (
                                    <div className="relative">
                                        <Image src={image} alt="Preview" width={96} height={64} className="rounded object-cover" unoptimized />
                                        <button
                                            type="button"
                                            onClick={() => setImage("")}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-muted/50">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = await handleUpload(file);
                                                if (url) setImage(url);
                                            }
                                        }}
                                        className="text-sm w-full"
                                        accept="image/*"
                                        disabled={uploading}
                                        required={!image}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Upload a cover image for the webinar card.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Schedule Webinar
                        </button>
                    </form>
                </div>
                ) : (
                    <div className="flex items-center justify-center p-12 border rounded-xl bg-card">
                        <div className="text-center space-y-2">
                            <Lock className="w-10 h-10 mx-auto text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">You don&apos;t have webinar access</p>
                            <p className="text-xs text-muted-foreground/70">Contact the owner to get webinar management permissions.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
