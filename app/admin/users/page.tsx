"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Mail, X, Check } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    phone?: string;
    assignedCategories?: string[];
    webinarAccess?: string;
    createdAt: string;
}

interface AuditLog {
    _id: string;
    action: string;
    details: string;
    ip?: string;
    country?: string;
    countryCode?: string;
    browser?: string;
    userId?: {
        name: string;
        role: string;
    };
    createdAt: string;
}

interface Category {
    _id: string;
    name: string;
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === "users" ? "/api/admin/users" : "/api/admin/logs";
            const res = await fetch(`${endpoint}?page=${page}&limit=20`);
            const data = await res.json();
            if (activeTab === "users") setUsersData(data);
            else setLogsData(data);

            // Fetch categories if not loaded
            if (categories.length === 0) {
                const catRes = await fetch("/api/categories");
                const catData = await catRes.json();
                setCategories(catData.categories || []);
            }
        } catch (error) {
            console.error("Fetch admin data error:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, categories.length]);

    const handleUpdateUser = async (role: string, assignedCategories: string[], webinarAccess: string) => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    role,
                    assignedCategories,
                    webinarAccess
                })
            });
            if (res.ok) {
                fetchData();
                setSelectedUser(null);
            }
        } catch (error) {
            console.error("Update user error:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">Owner Control</h1>
                    <p className="text-muted-foreground text-lg">Manage system roles, categories, and security logs.</p>
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
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-28">Webinar</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-40">Joined</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-20">Actions</th>
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
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'owner' ? 'bg-red-500/10 text-red-500' :
                                                    user.role === 'co_owner' ? 'bg-purple-500/10 text-purple-500' :
                                                        user.role === 'publisher' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-green-500/10 text-green-500'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role === 'owner' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600">✅ Full</span>
                                                ) : (user.webinarAccess && user.webinarAccess !== 'none') ? (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        user.webinarAccess === 'both' ? 'bg-green-500/10 text-green-600' :
                                                        user.webinarAccess === 'online' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                        {user.webinarAccess === 'both' ? '✅ Both' : user.webinarAccess === 'online' ? '🌐 Online' : '📍 Offline'}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role !== 'owner' && (
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="text-xs font-bold hover:underline text-primary"
                                                    >
                                                        Manage
                                                    </button>
                                                )}
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
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Location & IP</th>
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
                                                <div className="flex flex-col">
                                                    <span>{typeof log.userId === 'object' && log.userId !== null && 'name' in log.userId ? (log.userId as { name: string }).name : 'System'}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{(log.userId as any)?.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs break-words">
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded">{log.countryCode || '??'}</span>
                                                        <span className="text-xs">{log.country || 'Unknown'}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-muted-foreground">{log.ip || '0.0.0.0'}</span>
                                                </div>
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

            {/* Management Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-card border shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                            <div>
                                <h2 className="text-xl font-black">Manage User</h2>
                                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['co_owner', 'publisher', 'user'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setSelectedUser({ ...selectedUser, role: r })}
                                            className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all capitalize ${selectedUser.role === r ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-[0.98]' : 'hover:bg-muted'}`}
                                        >
                                            {r.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Allotment */}
                            {(selectedUser.role === 'publisher' || selectedUser.role === 'co_owner') && (
                                <div className="space-y-3 pt-4 border-t">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        Assign Categories
                                        <span className="block text-[10px] font-medium normal-case text-muted-foreground/70">
                                            {selectedUser.role === 'co_owner' ? 'Co-owners have full access to these categories' : 'Publishers can only manage notes in these categories'}
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto p-1">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat._id}
                                                onClick={() => {
                                                    const current = selectedUser.assignedCategories || [];
                                                    const updated = current.includes(cat._id)
                                                        ? current.filter(id => id !== cat._id)
                                                        : [...current, cat._id];
                                                    setSelectedUser({ ...selectedUser, assignedCategories: updated });
                                                }}
                                                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${selectedUser.assignedCategories?.includes(cat._id) ? 'bg-primary/5 border-primary/30 text-primary' : 'hover:bg-muted'}`}
                                            >
                                                {cat.name}
                                                {selectedUser.assignedCategories?.includes(cat._id) && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Webinar Access */}
                            {(selectedUser.role === 'co_owner' || selectedUser.role === 'publisher') && (
                                <div className="space-y-3 pt-4 border-t">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        Webinar Access
                                        <span className="block text-[10px] font-medium normal-case text-muted-foreground/70">
                                            Choose which webinar types this user can create and manage
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['none', 'online', 'offline', 'both'] as const).map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setSelectedUser({ ...selectedUser, webinarAccess: opt })}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                                                    (selectedUser.webinarAccess || 'none') === opt
                                                        ? 'bg-primary/5 border-primary/30 text-primary'
                                                        : 'hover:bg-muted'
                                                }`}
                                            >
                                                {opt === 'none' ? '🚫 None' : opt === 'online' ? '🌐 Online' : opt === 'offline' ? '📍 Offline' : '✅ Both'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-muted/30 flex gap-3">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 px-6 py-3 rounded-xl font-bold border hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateUser(selectedUser.role, selectedUser.assignedCategories || [], selectedUser.webinarAccess || 'none')}
                                disabled={isUpdating}
                                className="flex-1 px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
