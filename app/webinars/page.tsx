import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import dbConnect from "@/lib/db";
import Webinar from "@/models/Webinar";

// Re-validate every hour
export const revalidate = 3600;

async function getUpcomingWebinars() {
    await dbConnect();
    const now = new Date();
    const webinars = await Webinar.find({ timestamp: { $gte: now } }).sort({ timestamp: 1 }).lean();
    return JSON.parse(JSON.stringify(webinars));
}

async function getPastWebinars() {
    await dbConnect();
    const now = new Date();
    const webinars = await Webinar.find({ timestamp: { $lt: now } }).sort({ timestamp: -1 }).lean();
    return JSON.parse(JSON.stringify(webinars));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WebinarCard({ webinar, isPast = false }: { webinar: any; isPast?: boolean }) {
    return (
        <div className={`border border-border rounded-2xl bg-card overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group relative ${isPast ? 'opacity-70 hover:opacity-100' : ''} hover:-translate-y-2 hover:border-foreground hover:ring-1 hover:ring-foreground/10`}>
            <Link href={`/webinars/${webinar._id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View Details</span>
            </Link>

            <div className="aspect-video bg-muted relative overflow-hidden border-b border-border transition-colors group-hover:border-foreground">
                {webinar.image ? (
                    <Image
                        src={webinar.image}
                        alt={webinar.title}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'grayscale-[30%]' : ''}`}
                        unoptimized
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
                    {isPast && (
                        <div className="bg-muted-foreground/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-bold uppercase tracking-wider">
                            Completed
                        </div>
                    )}
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
                            <MapPin className="w-3 h-3" />
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
}

export default async function WebinarsPage() {
    const [upcomingWebinars, pastWebinars] = await Promise.all([
        getUpcomingWebinars(),
        getPastWebinars(),
    ]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Upcoming Webinars</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Join our expert-led sessions to level up your skills. Learn directly from industry professionals and get your questions answered live.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {upcomingWebinars.map((webinar: any) => (
                    <WebinarCard key={webinar._id} webinar={webinar} />
                ))}
                {upcomingWebinars.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        No upcoming webinars scheduled. Check back later!
                    </div>
                )}
            </div>

            {/* Past Events */}
            {pastWebinars.length > 0 && (
                <div className="space-y-6 pt-8 border-t">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Past Events</h2>
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                            {pastWebinars.length} completed
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {pastWebinars.map((webinar: any) => (
                            <WebinarCard key={webinar._id} webinar={webinar} isPast />
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Promo */}
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center my-12">
                <h2 className="text-2xl font-bold mb-4">Want to host your own webinars?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                    Publishers can create and manage their own webinar sessions. Apply to become a publisher today.
                </p>
                <button className="px-6 py-2 bg-background border rounded-full text-sm font-medium hover:bg-muted transition-colors">
                    Learn More
                </button>
            </div>
        </div>
    );
}

