"use client";

import { Users, Shield, PenSquare, Mail, Video } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const cards = [
        {
            title: "Users",
            description: "View and manage registered users, roles, and permissions.",
            href: "/admin/users",
            icon: Users,
            color: "blue",
            button: "Manage Users",
        },
        {
            title: "Audit Logs",
            description: "Audit logs for logins, role changes, and content actions.",
            href: "/admin/users?tab=logs",
            icon: Shield,
            color: "green",
            button: "View Logs",
        },
        {
            title: "Publishing Studio",
            description: "Create and manage notes, categories, and subcategories.",
            href: "/publish",
            icon: PenSquare,
            color: "purple",
            button: "Go to Publisher",
        },
        {
            title: "Contact Messages",
            description: "View messages from the contact form — bugs, feedback, copyright.",
            href: "/publish/contact",
            icon: Mail,
            color: "orange",
            button: "View Messages",
        },
        {
            title: "Webinars",
            description: "Create and manage webinar listings and schedules.",
            href: "/publish/webinars",
            icon: Video,
            color: "cyan",
            button: "Manage Webinars",
        },
    ];

    const colorMap: Record<string, { bg: string; text: string; hoverBg: string; btnBg: string }> = {
        blue: { bg: "bg-blue-500/10", text: "text-blue-500", hoverBg: "group-hover:bg-blue-500", btnBg: "bg-blue-500" },
        green: { bg: "bg-green-500/10", text: "text-green-500", hoverBg: "group-hover:bg-green-500", btnBg: "bg-green-500" },
        purple: { bg: "bg-purple-500/10", text: "text-purple-500", hoverBg: "group-hover:bg-purple-500", btnBg: "bg-purple-500" },
        orange: { bg: "bg-orange-500/10", text: "text-orange-500", hoverBg: "group-hover:bg-orange-500", btnBg: "bg-orange-500" },
        cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", hoverBg: "group-hover:bg-cyan-500", btnBg: "bg-cyan-500" },
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-12 px-4">
            <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <Shield className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tight">System Administration</h1>
                <p className="text-xl text-muted-foreground">
                    Manage system settings, users, and content.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 sm:grid-cols-2">
                {cards.map((card) => {
                    const c = colorMap[card.color];
                    const Icon = card.icon;
                    return (
                        <Link key={card.title} href={card.href} className="block rounded-xl border bg-card text-card-foreground shadow p-6 hover:shadow-lg hover:border-primary/20 transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 ${c.bg} ${c.text} rounded-lg ${c.hoverBg} group-hover:text-white transition-colors`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg">{card.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {card.description}
                            </p>
                            <div className={`w-full py-2 ${c.btnBg} text-white rounded-lg font-bold text-sm text-center`}>
                                {card.button}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

