"use client";

import { Users, Shield } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-12">
            <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <Shield className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tight">System Administration</h1>
                <p className="text-xl text-muted-foreground">
                    Manage system settings and user roles.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-xl">User Management</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        View and manage registered users, specific roles, and permissions.
                    </p>
                    <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors" disabled>
                        Coming Soon
                    </button>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 opacity-60">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-xl">System Logs</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Audit sensitive actions and view error logs.
                    </p>
                    <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors" disabled>
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
}
