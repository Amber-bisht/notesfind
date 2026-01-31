"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Mail } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    phone?: string;
    createdAt: string;
}

interface AuditLog {
    _id: string;
    action: string;
    details: string;
    userId?: {
        name: string;
    };
    createdAt: string;
}

interface PaginatedResponse<T> {
    users?: T[];
    logs?: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

function AdminUsersContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"users" | "logs">((searchParams.get("tab") as "logs") || "users");
    const [usersData, setUsersData] = useState<PaginatedResponse<AdminUser> | null>(null);
    const [logsData, setLogsData] = useState<PaginatedResponse<AuditLog> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === "users" ? "/api/admin/users" : "/api/admin/logs";
            const res = await fetch(`${endpoint}?page=${page}&limit=10`);
            const data = await res.json();
            if (activeTab === "users") setUsersData(data);
            else setLogsData(data);
        } catch (error) {
            console.error("Fetch admin data error:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">System Audit</h1>
                    <p className="text-muted-foreground text-lg">Manage users and monitor system activity.</p>
                </div>
                <div className="flex bg-muted p-1 rounded-xl">
                    <button
                        onClick={() => { setActiveTab("users"); setPage(1); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "users" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => { setActiveTab("logs"); setPage(1); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "logs" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                    >
                        Audit Logs
                    </button>
                </div>
            </div>

            <div className="bg-card border rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1">
                    {activeTab === "users" ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-12">User</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-40">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {usersData?.users?.map((user) => (
                                        <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {user.image ? (
                                                        <Image src={user.image} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full border" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {user.name?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-sm">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Mail className="w-3.5 h-3.5" /> {user.email}
                                                    </span>
                                                    {user.phone && (
                                                        <span className="text-xs text-muted-foreground/70">{user.phone}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                                                    user.role === 'publisher' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-green-500/10 text-green-500'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {loading && Array.from({ length: 10 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="h-16 bg-muted/10"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-40">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {logsData?.logs?.map((log) => (
                                        <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-primary/5 rounded-lg text-primary">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-tight">{log.action ? log.action.replace('_', ' ') : 'UNKNOWN'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {typeof log.userId === 'object' && log.userId !== null && 'name' in log.userId ? (log.userId as { name: string }).name : 'System'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs break-words">
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {loading && Array.from({ length: 10 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="h-16 bg-muted/10"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t bg-muted/20 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-bold text-foreground">{(page - 1) * 10 + 1}</span> to <span className="font-bold text-foreground">{Math.min(page * 10, (activeTab === "users" ? usersData : logsData)?.pagination.total || 0)}</span> of <span className="font-bold text-foreground">{(activeTab === "users" ? usersData : logsData)?.pagination.total || 0}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="p-2 border rounded-xl hover:bg-background transition-colors disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === (activeTab === "users" ? usersData : logsData)?.pagination.pages || loading}
                            className="p-2 border rounded-xl hover:bg-background transition-colors disabled:opacity-30"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
            <AdminUsersContent />
        </Suspense>
    );
}
