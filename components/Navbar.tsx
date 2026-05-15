"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { Menu, X, LogOut, User, LayoutDashboard, Settings, ChevronDown, ShieldCheck } from "lucide-react";
import { Search } from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, [pathname]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const navLinks = [
        { href: "/", label: "HOME" },
        { href: "/categories", label: "CATEGORIES" },
        { href: "/webinars", label: "WEBINARS" },
        { href: "/community", label: "JOIN COMMUNITY" },
    ];

    const adminLinks = [
        { href: "/publish", label: "PUBLISH" },
        { href: "/publish/webinars", label: "WEBINARS" },
        { href: "/admin/users", label: "SYSTEM AUDIT" },
        { href: "/publish/contact", label: "CONTACT" },
        { href: "/", label: "EXIT OWNER" },
    ];

    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/publish');
    const isAuthorized = user && ['owner', 'co_owner', 'publisher'].includes(user.role);

    const currentLinks = (isAuthorized && isAdminRoute) ? adminLinks : navLinks;

    return (
        <nav className="bg-background border-b sticky top-0 z-50 transition-colors duration-300">
            <div className="w-full px-6 h-20 md:h-24 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
                    <Logo className="h-14 md:h-16 w-auto" variant="header" />
                </Link>

                {/* Search Bar */}
                <div className="hidden lg:block flex-1 max-w-xl mx-4">
                    <Search />
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    {currentLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={cn(
                                "text-xs lg:text-sm font-black transition-colors hover:text-primary tracking-widest whitespace-nowrap",
                                pathname === link.href || (pathname === '/' && link.href === '/')
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 border-l pl-4">
                        <ThemeToggle />
                        
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
                                >
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            width={36}
                                            height={36}
                                            className="w-9 h-9 rounded-full object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                            {user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isProfileOpen && "rotate-180")} />
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-card border rounded-2xl shadow-xl py-2 z-[100] animate-in fade-in zoom-in duration-200">
                                        <div className="px-4 py-3 border-b mb-1">
                                            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        
                                        <Link 
                                            href="/dashboard" 
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                                            User Dashboard
                                        </Link>

                                        {isAuthorized && !isAdminRoute && (
                                            <Link 
                                                href="/publish" 
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-primary/10 text-primary transition-colors"
                                            >
                                                <ShieldCheck className="w-4 h-4" />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <div className="border-t mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <LogOut className="h-4 h-4" /> 
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link 
                                href="/auth" 
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black hover:opacity-90 transition-opacity"
                            >
                                LOGIN
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Icons */}
                <div className="md:hidden flex items-center gap-4">
                    <ThemeToggle />
                    {user && (
                         <Link href="/dashboard" className="w-8 h-8 rounded-full overflow-hidden border">
                            {user.image ? <Image src={user.image} alt="" width={32} height={32} /> : <div className="bg-primary/10 w-full h-full flex items-center justify-center text-[10px]">{user.name?.[0]}</div>}
                         </Link>
                    )}
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-foreground">
                        {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border p-4 space-y-4 bg-background fixed inset-x-0 top-20 bottom-0 overflow-y-auto z-40">
                    <div className="pb-4 border-b">
                        <Search />
                    </div>
                    {currentLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-lg font-black py-2 text-foreground hover:text-primary tracking-wide"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link 
                                href="/dashboard" 
                                onClick={() => setIsOpen(false)}
                                className="block text-lg font-black py-2 text-foreground hover:text-primary"
                            >
                                DASHBOARD
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="w-full flex items-center gap-2 text-lg font-black py-2 text-destructive border-t pt-4"
                            >
                                <LogOut className="h-6 w-6" /> SIGN OUT
                            </button>
                        </>
                    ) : (
                        <Link 
                            href="/auth" 
                            onClick={() => setIsOpen(false)} 
                            className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-black"
                        >
                            LOGIN
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
