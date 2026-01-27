"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, [pathname]);

    // Use CSS filters for logo color
    const logoClass = mounted && (theme === 'light' || resolvedTheme === 'light')
        ? "h-12 w-auto brightness-0"
        : "h-12 w-auto brightness-0 invert";

    const navLinks = [
        { href: "/", label: "HOME" },
        { href: "/#categories", label: "CATEGORIES" },
        { href: "/community", label: "JOIN COMMUNITY" },
        { href: "/pages", label: "PAGES" },
    ];

    if (user) {
        navLinks.push({ href: "/dashboard", label: "DASHBOARD" });

        if (["admin", "publisher"].includes(user.role)) {
            navLinks.push({ href: "/publish", label: "PUBLISH" });
        }
        if (user.role === "admin") {
            navLinks.push({ href: "/admin", label: "ADMIN" });
        }
    }

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                {/* Logo & Title */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img src="/image.png" alt="NotesFind" className={logoClass} />
                    <span className="text-3xl font-black tracking-tighter">NotesFind</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={cn(
                                "text-base font-bold transition-colors hover:text-primary tracking-wide",
                                pathname === link.href || (pathname === '/' && link.href === '/')
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 ml-4">
                        {user ? (
                            <Link href="/dashboard" className="flex items-center gap-2">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <Link href="/auth" className="text-base font-medium text-muted-foreground hover:text-primary">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Nav Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                        {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background fixed inset-x-0 top-24 bottom-0 overflow-y-auto z-40">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-lg font-bold py-2 hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!user && (
                        <Link href="/auth" onClick={() => setIsOpen(false)} className="block text-lg font-bold py-2 hover:text-primary">
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
