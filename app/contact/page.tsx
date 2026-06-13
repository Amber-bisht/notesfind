"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle, Link as LinkIcon, Lock, MapPin, Mail, Clock3 } from "lucide-react";
import Turnstile from "react-turnstile";

export default function ContactPage() {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [cfToken, setCfToken] = useState("");

    // Form Fields
    const [message, setMessage] = useState("");
    const [referenceLink, setReferenceLink] = useState("");
    const [tag, setTag] = useState("General");


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user ?? null);
                } else {
                    setUser(null); // not logged in — show form with login prompt
                }
            } catch (err) {
                console.error("Verification error:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

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
            console.error("Submission error:", err);
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

    if (!user && !loading) {
        // Show form with login prompt — don't redirect
    }


    if (success) {
        return (
            <div className="container max-w-lg py-20 px-4">
                <div className="bg-card border rounded-2xl p-8 text-center space-y-4 shadow-lg">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Message Sent!</h1>
                    <p className="text-muted-foreground">
                        Thanks for reaching out, {user?.name}. We&apos;ll get back to you at {user?.email} as soon as possible.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90"
                    >
                        Send Another
                    </button>
                    <div className="pt-4">
                        <a href="/" className="text-sm text-primary hover:underline">
                            Return Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-12 px-4">
            <div className="space-y-2 mb-8 text-center">
                <h1 className="text-4xl font-black tracking-tight">Contact Us</h1>
                <p className="text-muted-foreground text-lg">
                    Have a question, found a bug, or just want to say hi?
                </p>
            </div>

            {/* Login required banner */}
            {!user && (
                <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            You must be logged in to send a message.
                        </p>
                    </div>
                    <a
                        href="/auth?redirect=/contact"
                        className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors"
                    >
                        Login
                    </a>
                </div>
            )}

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

                {/* LEFT — Form */}
                <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Identity - Locked */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl border border-dashed">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Name</label>
                                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border text-muted-foreground cursor-not-allowed">
                                    <Lock className="w-3 h-3" />
                                    <span className="text-sm font-medium">{user ? user.name : <span className="italic opacity-50">Login to autofill</span>}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Email</label>
                                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border text-muted-foreground cursor-not-allowed">
                                    <Lock className="w-3 h-3" />
                                    <span className="text-sm font-medium">{user ? user.email : <span className="italic opacity-50">Login to autofill</span>}</span>
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
                            disabled={submitting || !cfToken || !user}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Message
                        </button>
                    </form>
                </div>

                {/* RIGHT — Contact Info */}
                <div className="space-y-4 lg:sticky lg:top-8">
                    {/* Email */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Mail Us At</p>
                            <a
                                href="mailto:notefind@gmail.com"
                                className="text-sm font-semibold text-primary hover:underline break-all"
                            >
                                notefind@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Our Office</p>
                            <address className="not-italic text-sm leading-relaxed text-foreground">
                                NoteFind HQ<br />
                                42 Knowledge Park, Sector 18<br />
                                Noida, Uttar Pradesh 201301<br />
                                India
                            </address>
                        </div>
                    </div>

                    {/* Response time */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Clock3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Response Time</p>
                            <p className="text-sm text-foreground">We typically reply within <span className="font-semibold">24–48 hours</span> on business days.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
