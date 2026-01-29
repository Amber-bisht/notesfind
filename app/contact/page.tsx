"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle, Link as LinkIcon, Lock } from "lucide-react";
import Turnstile from "react-turnstile";
import { useRouter } from "next/navigation";

export default function ContactPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [cfToken, setCfToken] = useState("");

    // Form Fields
    const [message, setMessage] = useState("");
    const [referenceLink, setReferenceLink] = useState("");
    const [tag, setTag] = useState("General");

    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    router.push('/auth?redirect=/contact');
                }
            } catch (err) {
                setError("Failed to verify identity.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cfToken) {
            setError("Please complete the CAPTCHA.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    referenceLink,
                    tag,
                    cfToken
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setMessage("");
                setReferenceLink("");
                setCfToken("");
            } else {
                setError(data.error || "Failed to submit.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Should redirect in useEffect

    if (success) {
        return (
            <div className="container max-w-lg py-20 px-4">
                <div className="bg-card border rounded-2xl p-8 text-center space-y-4 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Message Sent!</h1>
                    <p className="text-muted-foreground">
                        Thanks for reaching out, {user.name}. We'll get back to you at {user.email} as soon as possible.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90"
                    >
                        Send Another
                    </button>
                    <div className="pt-4">
                        <button onClick={() => router.push('/')} className="text-sm text-primary hover:underline">
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-12 px-4">
            <div className="space-y-2 mb-8 text-center">
                <h1 className="text-4xl font-black tracking-tight">Contact Us</h1>
                <p className="text-muted-foreground text-lg">
                    Have a question, found a bug, or just want to say hi?
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Identity - Locked */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl border border-dashed">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Name</label>
                            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border text-muted-foreground cursor-not-allowed">
                                <Lock className="w-3 h-3" />
                                <span className="text-sm font-medium">{user.name}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Email</label>
                            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border text-muted-foreground cursor-not-allowed">
                                <Lock className="w-3 h-3" />
                                <span className="text-sm font-medium">{user.email}</span>
                            </div>
                        </div>
                        <div className="col-span-full text-xs text-center text-muted-foreground">
                            * Identity automatically verified from your account
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Subject / Tag</label>
                            <select
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="General">General Inquiry</option>
                                <option value="Copyright">Copyright Issue</option>
                                <option value="Bug">Report a Bug</option>
                                <option value="Feedback">Feedback</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Reference Link (Optional)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="url"
                                    value={referenceLink}
                                    onChange={(e) => setReferenceLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="How can we help you?"
                            required
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-y min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-center py-2">
                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY || ""}
                            onVerify={(token) => setCfToken(token)}
                            theme="auto"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !cfToken}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}
