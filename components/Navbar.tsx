"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fetch user to check login state
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, [pathname]); // Re-fetch on navigation

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/notes", label: "Notes" }, // Assuming a general notes listing or we can rely on categories
    ];

    if (user) {
        if (["admin", "publisher"].includes(user.role)) {
            navLinks.push({ href: "/dashboard", label: "Dashboard" });
        }
        if (user.role === "admin") {
            navLinks.push({ href: "/admin", label: "Admin" });
        }
    }

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    NotesFind
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-2">
                                {user.image && <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />}
                            </div>
                        ) : (
                            <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-primary">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Nav Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-sm font-medium hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!user && (
                        <Link href="/auth" onClick={() => setIsOpen(false)} className="block text-sm font-medium hover:text-primary">
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
