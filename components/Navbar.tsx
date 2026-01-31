"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Search } from "./Search";
import { Nunito } from "next/font/google";
import { ThemeToggle } from "./ThemeToggle";

const nunito = Nunito({ subsets: ["latin"], weight: ["900"] });

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                setUser(null);
                window.location.href = '/';
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Use CSS filters for logo color
    // Logo is now a proper image, remove filters that turn it into a black box
    const logoClass = "h-24 w-auto object-contain invert dark:invert-0";

    const navLinks = [
        { href: "/", label: "HOME" },
        { href: "/categories", label: "CATEGORIES" },
        { href: "/webinars", label: "WEBINARS" },
        { href: "/services", label: "SERVICES" },
        { href: "/community", label: "JOIN COMMUNITY" },
    ];

    const adminLinks = [
        { href: "/publish", label: "PUBLISH" },
        { href: "/publish/webinars", label: "WEBINARS" },
        { href: "/admin/services", label: "SERVICES" },
        { href: "/publish/request", label: "REQUESTS" },
        { href: "/publish/contact", label: "CONTACT" },
        { href: "/", label: "EXIT ADMIN" }, // Link to go back to main site
    ];

    let currentLinks = navLinks;
    // Check if user is admin/publisher AND accessing admin routes
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/publish');
    const isAuthorized = user && (user.role === 'admin' || user.role === 'publisher');

    if (isAuthorized && isAdminRoute) {
        currentLinks = adminLinks;
    } else if (user && (user.role === 'admin' || user.role === 'publisher')) {
        // Optionally push a "Dashboard" or "Admin" link to main nav if they are authorized but on main site
        // For now, let's keep the user-dashboard link, maybe add specific Admin entry point?
        // user.role check is enough to show Dashboard, maybe we redirect Dashboard to Admin?
        // Keeping as is for user constraints, just swapping if *in* admin route.
    }

    if (user && !isAdminRoute) {
        // Normal user dashboard link, effectively replacing the old "Push" logic with a consistent list
        // Check if already exists to avoid dupes on re-renders if we were pushing
        if (!currentLinks.find(l => l.label === "DASHBOARD")) {
            currentLinks = [...currentLinks, { href: "/dashboard", label: "DASHBOARD" }];
        }
    }

    return (
        <nav className="bg-background border-b sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                {/* Logo & Title */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Image
                        src="/logo-white.png"
                        alt="NotesFind"
                        width={200}
                        height={96}
                        className={logoClass}
                    />
                    <span className={`text-3xl font-black tracking-tighter hidden lg:block text-foreground ${nunito.className}`}>NotesFind</span>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-md mx-6">
                    <Search />
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {currentLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={cn(
                                "text-sm font-bold transition-colors hover:text-primary tracking-wide whitespace-nowrap",
                                pathname === link.href || (pathname === '/' && link.href === '/')
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 ml-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full border"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/auth" className="text-base font-medium text-muted-foreground hover:text-foreground">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Nav Toggle */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
                        {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border p-4 space-y-4 bg-background fixed inset-x-0 top-24 bottom-0 overflow-y-auto z-40">
                    {currentLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-lg font-bold py-2 text-foreground hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <button
                            onClick={() => { handleLogout(); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 text-lg font-bold py-2 text-destructive"
                        >
                            <LogOut className="h-5 w-5" /> Logout
                        </button>
                    ) : (
                        <Link href="/auth" onClick={() => setIsOpen(false)} className="block text-lg font-bold py-2 text-foreground hover:text-primary">
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
