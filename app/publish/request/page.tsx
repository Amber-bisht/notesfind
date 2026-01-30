"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MessageSquare, User, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Request {
    _id: string;
    name: string;
    email: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function RequestPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            const data = await res.json();

            if (res.ok) {
                setRequests(data.requests);
            } else {
                if (res.status === 401) {
                    setError("Unauthorized. Please log in as admin.");
                } else {
                    setError(data.error || "Failed to fetch requests");
                }
            }
        } catch {
            setError("An error occurred while fetching requests.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-[50vh] items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
                <Link href="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Resource Requests</h1>

            {requests.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No pending requests found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div key={req._id} className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-lg">
                                        <User className="w-4 h-4 text-primary" />
                                        {req.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <a href={`mailto:${req.email}`} className="hover:text-primary transition-colors">{req.email}</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full w-fit">
                                    <Clock className="w-3 h-3" />
                                    {new Date(req.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{req.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
