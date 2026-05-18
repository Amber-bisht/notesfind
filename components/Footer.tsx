import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "./Logo";

async function getFooterCategories() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/categories`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return [];

        const { categories } = await res.json();
        const slugs = ["dsa", "web-development", "machine-learning", "system-design"];

        return categories
            .filter((c: any) => slugs.includes(c.slug))
            .sort((a: any, b: any) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));

    } catch (error) {
        return [];
    }
}

export async function Footer() {
    const categories = await getFooterCategories();

    const fallbackResources = [
        { name: "Data Structures", slug: "dsa" },
        { name: "Web Development", slug: "web-development" },
        { name: "Machine Learning", slug: "machine-learning" },
        { name: "System Design", slug: "system-design" },
    ];

    const resources = categories.length > 0 ? categories : fallbackResources;

    return (
        <footer className="border-t py-16 bg-background relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <Logo className="h-10 md:h-12 w-auto" />
                        </Link>
                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            The ultimate resource for developers and students. Quality notes, detailed blogs, and a growing community of tech enthusiasts.
                        </p>
                        <div className="flex items-center gap-5">
                            <Link href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">Navigation</h3>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                                <li><Link href="/pages" className="hover:text-primary transition-colors">Browse Notes</Link></li>
                                <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
                                <li><Link href="/dashboard" className="hover:text-primary transition-colors">User Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">Topics</h3>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                {resources.map((res: any) => (
                                    <li key={res.slug}>
                                        <Link href={`/${res.slug}`} className="hover:text-primary transition-colors line-clamp-1">
                                            {res.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">Support</h3>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                <li><Link href="/about" className="hover:text-primary transition-colors">About Team</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="font-medium">&copy; {new Date().getFullYear()} <span className="text-foreground">NotesFind</span>. All rights reserved.</p>
                        <p className="font-medium text-xs">This website is managed by <a href="https://amberbisht.me" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-foreground">Amber Bisht</a></p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <Link href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</Link>
                        <div className="w-px h-4 bg-border hidden md:block" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </footer>
    );
}