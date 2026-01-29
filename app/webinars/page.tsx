"use client";

import { useState, useEffect } from "react";
import { Calendar, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Webinar {
    _id: string;
    title: string;
    description: string;
    timestamp: string;
    link: string;
    image: string;
    type?: 'online' | 'offline';
    venue?: string;
    address?: string;
    createdBy: {
        name: string;
    }
}

export default function WebinarsPage() {
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Join Modal State
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [selectedWebinarId, setSelectedWebinarId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [joining, setJoining] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchWebinars();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }

    const fetchWebinars = async () => {
        try {
            const res = await fetch("/api/webinars");
            const data = await res.json();
            setWebinars(data.webinars || []);
        } catch (error) {
            console.error("Failed to fetch webinars", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClick = (webinarId: string) => {
        if (!user) {
            router.push("/auth"); // Redirect to login if not authenticated
            return;
        }

        const alreadyJoined = user.joinedWebinars?.some((jw: any) => jw.webinarId?._id === webinarId || jw.webinarId === webinarId);
        if (alreadyJoined) {
            router.push("/dashboard");
            return;
        }

        setSelectedWebinarId(webinarId);
        if (user.phone) {
            // User has phone, just join
            joinWebinar(webinarId, user.phone);
        } else {
            // Ask for phone
            setJoinModalOpen(true);
        }
    };

    const joinWebinar = async (webinarId: string, phone: string) => {
        setJoining(true);
        try {
            const res = await fetch('/api/webinars/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webinarId, phone })
            });

            if (res.ok) {
                setJoinModalOpen(false);
                alert("Successfully joined webinar! You can view it in your dashboard.");
                router.push("/dashboard");
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

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        joinWebinar(selectedWebinarId, phoneNumber);
    }

    if (loading) return <div className="p-8 text-center">Loading upcoming webinars...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Upcoming Webinars</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Join our expert-led sessions to level up your skills. Learn directly from industry professionals and get your questions answered live.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webinars.map((webinar) => {
                    const isJoined = user && user.joinedWebinars?.some((jw: any) => jw.webinarId?._id === webinar._id || jw.webinarId === webinar._id); // eslint-disable-line @typescript-eslint/no-explicit-any

                    return (
                        <div key={webinar._id} className="border rounded-xl bg-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                            <Link href={`/webinars/${webinar._id}`} className="absolute inset-0 z-10">
                                <span className="sr-only">View Details</span>
                            </Link>

                            <div className="aspect-video bg-muted relative overflow-hidden">
                                {webinar.image ? (
                                    <img
                                        src={webinar.image}
                                        alt={webinar.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-primary/10 text-primary">Webinar</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
                                        {new Date(webinar.timestamp).toLocaleDateString()}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded backdrop-blur-sm font-bold uppercase tracking-wider ${webinar.type === 'offline'
                                        ? 'bg-orange-500/90 text-white'
                                        : 'bg-blue-500/90 text-white'
                                        }`}>
                                        {webinar.type === 'offline' ? 'Offline' : 'Online'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col relative z-20 pointer-events-none">
                                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{webinar.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(webinar.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {webinar.venue && (
                                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                                            <UserIcon className="w-3 h-3" /> {/* Re-using icon just for layout match, usually MapPin */}
                                            {webinar.venue}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{webinar.description}</p>

                                <button className="w-full py-2 bg-muted text-foreground rounded-lg font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all text-sm mt-auto">
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
                {webinars.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        No upcoming webinars scheduled. Check back later!
                    </div>
                )}
            </div>

            {/* Quick Promo */}
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center my-12">
                <h2 className="text-2xl font-bold mb-4">Want to hose your own webinars?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                    Publishers can create and manage their own webinar sessions. Apply to become a publisher today.
                </p>
                <button className="px-6 py-2 bg-background border rounded-full text-sm font-medium hover:bg-muted transition-colors">
                    Learn More
                </button>
            </div>

            {/* Phone Number Modal */}
            {joinModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2">Final Step</h3>
                        <p className="text-muted-foreground mb-4">Please provide your phone number to complete registration. We&apos;ll calculate joining statistics.</p>
                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="+1 234 567 8900"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setJoinModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={joining}
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                                >
                                    {joining ? "Joining..." : "Complete Registration"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
