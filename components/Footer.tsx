import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

export function Footer() {
    return (
        <footer className="border-t py-12 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo-white.png"
                                alt="NotesFind"
                                width={150}
                                height={48}
                                className="h-12 w-auto invert dark:invert-0"
                            />
                            <span className="font-bold text-xl">NotesFind</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            The ultimate resource for developers, students, and tech enthusiasts.
                            Find quality notes for free.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                            <li><Link href="/pages" className="hover:text-foreground">Browse Notes</Link></li>
                            <li><Link href="/community" className="hover:text-foreground">Community</Link></li>
                            <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/dsa" className="hover:text-foreground">Data Structures</Link></li>
                            <li><Link href="/web-dev" className="hover:text-foreground">Web Development</Link></li>
                            <li><Link href="/ml" className="hover:text-foreground">Machine Learning</Link></li>
                            <li><Link href="/system-design" className="hover:text-foreground">System Design</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Email: chankyafoundation14@gmail.com</li>
                            <li>Location: Kedarnath, Uttarakhand</li>
                            <li>
                                <Link href="/contact" className="text-primary hover:underline">
                                    Contact Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <p>&copy; {new Date().getFullYear()} NotesFind. All rights reserved.</p>
                        <ThemeToggle />
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
