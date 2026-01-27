import Link from "next/link";
import {
    MessageCircle,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    ExternalLink,
    Globe
} from "lucide-react";
import communityData from "@/data/community-links.json";

// Map icon strings to components
const iconMap: { [key: string]: any } = {
    MessageCircle,
    Facebook,
    Twitter,
    Linkedin,
    Youtube
};

export const metadata = {
    title: "Join Our Community | Note.com",
    description: "Connect with us on social media and join our growing community.",
};

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
                        Join the Community
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Connect with us, stay updated, and be part of the conversation across all our platforms.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {communityData.map((platform, index) => {
                        const IconComponent = iconMap[platform.icon] || Globe;

                        return (
                            <div
                                key={platform.platform}
                                className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{platform.platform}</h2>
                                </div>

                                <p className="text-muted-foreground mb-8 min-h-[3rem]">
                                    {platform.description}
                                </p>

                                <div className="space-y-3">
                                    {platform.links.map((link, linkIndex) => (
                                        <Link
                                            key={linkIndex}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group/link"
                                        >
                                            <span className="font-medium">{link.name}</span>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/link:text-foreground transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-muted-foreground">
                        Have a question? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
