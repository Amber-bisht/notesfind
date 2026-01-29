"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MessageSquare, AlertCircle, Link as LinkIcon, Lock } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    referenceLink?: string;
    tag: string;
    createdAt: string;
}

export default function AdminContactPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch('/api/contact');
                if (!res.ok) {
                    if (res.status === 401) {
                        router.push('/'); // Or login
                        return;
                    }
                    throw new Error('Failed to fetch');
                }
                const data = await res.json();
                setMessages(data.contacts);
            } catch (err) {
                setError("Failed to load messages.");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-20 text-destructive">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Mail className="w-8 h-8" />
                Contact Messages
                <span className="text-base font-normal text-muted-foreground ml-2 px-3 py-1 bg-muted rounded-full">
                    {messages.length} Total
                </span>
            </h1>

            <div className="grid gap-6">
                {messages.length === 0 ? (
                    <div className="text-center py-12 bg-card border rounded-xl">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-muted-foreground">No messages yet</h3>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id} className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold">{msg.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${msg.tag === 'Bug' ? 'bg-red-50 text-red-600 border-red-200' :
                                                msg.tag === 'Copyright' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    msg.tag === 'Feedback' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {msg.tag}
                                        </span>
                                    </div>
                                    <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                                        {msg.email}
                                    </a>
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(msg.createdAt), "PPP p")}
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg text-sm leading-relaxed mb-4">
                                {msg.message}
                            </div>

                            {msg.referenceLink && (
                                <div className="flex items-center gap-2 text-sm">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Ref:</span>
                                    <a href={msg.referenceLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-md">
                                        {msg.referenceLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
