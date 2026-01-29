"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import Turnstile from "react-turnstile";

export function RequestResourceForm() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [cfToken, setCfToken] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    setIsAuthenticated(true);
                }
            } catch (err) {
                // Ignore error, treat as guest
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cfToken) {
            setError("Please complete the CAPTCHA.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, cfToken })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setMessage("");
                setCfToken(""); // Reset token on success if needed, though widget usually needs reset
            } else {
                setError(data.error || "Failed to submit request.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="bg-card border rounded-2xl p-10 shadow-xl flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="bg-card border rounded-2xl p-10 shadow-xl text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <h2 className="text-2xl font-black tracking-tight mb-4 relative">Request Resources</h2>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 ml-1" />
                </div>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Looking for specific notes? Log in to submit a request and we'll prioritize creating them for you.
                </p>
                <a href="/auth" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity">
                    Login to Request
                </a>
            </div>
        );
    }

    if (success) {
        return (
            <div className="bg-card border rounded-2xl p-8 text-center space-y-4 shadow-lg">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Request Sent!</h3>
                <p className="text-muted-foreground">
                    Thank you for your suggestion. We'll review it and get back to you shortly.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-primary font-bold hover:underline"
                >
                    Send another request
                </button>
            </div>
        );
    }

    return (
        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Request Resources</h2>
                    <p className="text-muted-foreground">
                        Can't find what you're looking for? Let us know!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-bold ml-1">What do you need?</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe the notes, books, or resources you are looking for..."
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border bg-background/50 focus:bg-background transition-colors focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-center">
                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY || ""}
                            onVerify={(token) => setCfToken(token)}
                            theme="auto"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !cfToken}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Submit Request
                    </button>

                    <p className="text-xs text-center text-muted-foreground pt-2">
                        We prioritize requests from registered community members.
                    </p>
                </form>
            </div>
        </div>
    );
}
