"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, Globe, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Webinar {
    _id: string;
    title: string;
    description: string;
    longDescription?: string;
    timestamp: string;
    link?: string;
    image: string;
    type: 'online' | 'offline';
    venue?: string;
    address?: string;
    mapLink?: string;
    createdBy: {
        name: string;
    }
}

export default function WebinarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [webinar, setWebinar] = useState<Webinar | null>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [isJoined, setIsJoined] = useState(false);

    // Join Modal State
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        phone: "",
        jobTitle: "",
        age: "",
        country: "",
        district: "",
        organization: ""
    });
    const [joining, setJoining] = useState(false);

    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }, []);

    const checkIfJoined = useCallback((webinar: Webinar, currentUser: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!currentUser || !webinar) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joined = currentUser.joinedWebinars?.some((jw: any) => jw.webinarId?._id === webinar._id || jw.webinarId === webinar._id);
        setIsJoined(!!joined);
    }, []);

    const fetchWebinar = useCallback(async (id: string) => {
        try {
            const res = await fetch("/api/webinars");
            const data = await res.json();
            const found = data.webinars?.find((w: Webinar) => w._id === id);

            if (found) {
                setWebinar(found);
                // We will check joined status in another effect when user is also loaded
            }
        } catch (error) {
            console.error("Failed to fetch webinar", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params;
            await fetchUser();
            fetchWebinar(resolvedParams.id);
        };
        init();
    }, [params, fetchUser, fetchWebinar]);

    // We need to re-check joined status once user AND webinar are loaded
    useEffect(() => {
        if (user && webinar) {
            checkIfJoined(webinar, user);
        }
    }, [user, webinar, checkIfJoined]);

    const handleJoinClick = () => {
        if (!user) {
            router.push("/auth?redirect=/webinars/" + webinar?._id);
            return;
        }

        if (isJoined) {
            router.push("/dashboard");
            return;
        }

        // Check if user has all required fields
        const missingFields = [];
        if (!user.phone) missingFields.push('phone');
        if (!user.jobTitle) missingFields.push('jobTitle');
        if (!user.age) missingFields.push('age');
        if (!user.country) missingFields.push('country');
        if (!user.district) missingFields.push('district');
        if (!user.organization) missingFields.push('organization');

        if (missingFields.length === 0) {
            // User has all fields, just join
            joinWebinar(webinar!._id, {});
        } else {
            // Open modal to fill missing fields
            setJoinModalOpen(true);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const joinWebinar = async (webinarId: string, additionalData: any) => {
        setJoining(true);
        try {
            const res = await fetch('/api/webinars/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webinarId, ...additionalData })
            });

            if (res.ok) {
                setJoinModalOpen(false);
                setIsJoined(true);
                alert("Successfully registered! detailed info is now available in your dashboard.");
                // Refresh user to get updated fields
                fetchUser();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to join webinar.");
            }
        } catch (error) {
            console.error("Join error:", error);
            alert("An error occurred.");
        } finally {
            setJoining(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (webinar) {
            joinWebinar(webinar._id, formData);
        }
    }

    if (loading) return <div className="p-12 text-center">Loading details...</div>;
    if (!webinar) return <div className="p-12 text-center">Webinar not found.</div>;

    const eventDate = new Date(webinar.timestamp);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px] w-full bg-muted">
                <Image
                    src={webinar.image}
                    alt={webinar.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-6 left-6 md:left-12">
                    <Link href="/webinars" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Webinars
                    </Link>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-6 -mt-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider ${webinar.type === 'offline' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                } border`}>
                                {webinar.type === 'offline' ? 'In-Person Event' : 'Online Webinar'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">{webinar.title}</h1>
                            <div className="flex flex-wrap gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-foreground">{eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <span>• {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {webinar.venue && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span className="font-medium text-foreground">{webinar.venue}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <h3 className="text-2xl font-bold mb-4">About this Event</h3>
                            <div className="space-y-4">
                                <p className="font-bold text-lg text-foreground whitespace-pre-wrap break-words">
                                    {webinar.description}
                                </p>
                                {webinar.longDescription && (
                                    <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground break-words">
                                        {webinar.longDescription}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Action Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border rounded-2xl p-6 shadow-xl sticky top-24">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Presented By</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {webinar.createdBy?.name?.[0] || "H"}
                                        </div>
                                        <span className="font-bold">{webinar.createdBy?.name || "Host"}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    {webinar.type === 'offline' && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Location</p>
                                            <p className="font-semibold">{webinar.venue}</p>
                                            <p className="text-sm text-muted-foreground">{webinar.address}</p>
                                            {webinar.mapLink && (
                                                <a href={webinar.mapLink} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline inline-flex items-center mt-1">
                                                    View on Map <MapPin className="w-3 h-3 ml-1" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {webinar.type === 'online' && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Platform</p>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Globe className="w-4 h-4" /> Online
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleJoinClick}
                                    disabled={isJoined}
                                    className={`w-full py-4 text-lg font-bold rounded-xl transition-all shadow-lg transform active:scale-95 ${isJoined
                                        ? "bg-green-100 text-green-700 cursor-default shadow-none"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25"
                                        }`}
                                >
                                    {isJoined ? "You're Registered" : "Register Now"}
                                </button>

                                {isJoined && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        Check your <Link href="/dashboard" className="text-foreground underline">Dashboard</Link> for access details.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phone Number Modal */}
            {joinModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-2xl p-8 max-w-md w-full shadow-2xl border">
                        <h3 className="text-2xl font-bold mb-2">Complete Profile to Join</h3>
                        <p className="text-muted-foreground mb-6">Please provide a few details to complete your registration.</p>
                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            {!user?.phone && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="+1 234 567 8900"
                                        required
                                    />
                                </div>
                            )}
                            {!user?.jobTitle && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Job Title / Role</label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="e.g. Student, Developer"
                                        required
                                    />
                                </div>
                            )}
                            {!user?.age && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="e.g. 24"
                                        required
                                    />
                                </div>
                            )}
                            {!user?.country && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                            placeholder="Country"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">District/City</label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                            placeholder="District"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                            {!user?.organization && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">College / Company</label>
                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="Institute or Company Name"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setJoinModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold hover:bg-muted rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={joining}
                                    className="px-6 py-2 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors shadow-lg hover:shadow-primary/20"
                                >
                                    {joining ? "Registering..." : "Complete & Join"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
