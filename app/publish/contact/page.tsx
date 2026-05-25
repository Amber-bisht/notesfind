"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MessageSquare, AlertCircle, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    referenceLink?: string;
    tag: string;
    replied?: boolean;
    repliedAt?: string;
    replyMessage?: string;
    createdAt: string;
}

export default function AdminContactPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
    const [replySubject, setReplySubject] = useState("");
    const [replyText, setReplyText] = useState("");
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [replyError, setReplyError] = useState<string | null>(null);

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
            } catch {
                setError("Failed to load messages.");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [router]);

    const handleOpenReply = (msg: ContactMessage) => {
        setReplyingMessageId(msg._id);
        setReplySubject(`Reply to your contact message [${msg.tag}]`);
        setReplyText(`Hi ${msg.name},\n\n`);
        setReplyError(null);
    };

    const handleSendReply = async (msgId: string) => {
        if (!replySubject.trim() || !replyText.trim()) {
            setReplyError("Subject and message are required.");
            return;
        }

        setSendingId(msgId);
        setReplyError(null);

        try {
            const res = await fetch(`/api/contact/${msgId}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subject: replySubject,
                    replyMessage: replyText,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send reply");
            }

            // Update local messages state
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === msgId
                        ? {
                              ...msg,
                              replied: true,
                              repliedAt: new Date().toISOString(),
                              replyMessage: replyText,
                          }
                        : msg
                )
            );

            // Clear state
            setReplyingMessageId(null);
            setReplySubject("");
            setReplyText("");
        } catch (err) {
            setReplyError((err as Error).message);
        } finally {
            setSendingId(null);
        }
    };

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
                                        {msg.replied && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-200 font-bold">
                                                ✓ Replied
                                            </span>
                                        )}
                                    </div>
                                    <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                                        {msg.email}
                                    </a>
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(msg.createdAt), "PPP p")}
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg text-sm leading-relaxed">
                                {msg.message}
                            </div>

                            {msg.replied && msg.replyMessage && (
                                <div className="mt-4 p-4 border border-green-500/15 bg-green-500/5 rounded-lg text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-xs text-green-600 uppercase tracking-wider flex items-center gap-1">
                                            📬 Your Reply
                                        </span>
                                        {msg.repliedAt && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {format(new Date(msg.repliedAt), "PPP p")}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {msg.replyMessage}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex flex-col gap-3">
                                {replyingMessageId !== msg._id ? (
                                    <div className="flex justify-between items-center pt-2 border-t border-muted/50">
                                        {msg.referenceLink ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Ref:</span>
                                                <a href={msg.referenceLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs md:max-w-md">
                                                    {msg.referenceLink}
                                                </a>
                                            </div>
                                        ) : (
                                            <div />
                                        )}
                                        <button
                                            onClick={() => handleOpenReply(msg)}
                                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-1.5"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            {msg.replied ? "Reply Again" : "Reply via Resend"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Draft Reply (via Resend)
                                        </h4>
                                        {replyError && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg">
                                                {replyError}
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Email Subject</label>
                                                <input
                                                    type="text"
                                                    value={replySubject}
                                                    onChange={(e) => setReplySubject(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    placeholder="Subject"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Message Body</label>
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    rows={5}
                                                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    placeholder="Write your email reply here..."
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setReplyingMessageId(null)}
                                                className="px-4 py-2 text-xs font-bold border rounded-lg hover:bg-muted transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSendReply(msg._id)}
                                                disabled={sendingId === msg._id}
                                                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5"
                                            >
                                                {sendingId === msg._id ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    "Send Email"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
