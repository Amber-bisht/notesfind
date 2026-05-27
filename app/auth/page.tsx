"use client";

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthContent() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorParam = searchParams.get('error');
    const redirectParam = searchParams.get('redirect');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (errorParam) {
            if (errorParam === 'Your account has been banned.') {
                setErrorMsg("You are banned, bitch!");
            } else if (errorParam === 'login_failed') {
                setErrorMsg("Login failed. Please try again.");
            } else if (errorParam === 'login_error') {
                setErrorMsg("An error occurred during login. Please try again.");
            } else {
                setErrorMsg(errorParam);
            }
        }
    }, [errorParam]);

    // Handle Popup Credential (ID Token)
    const handleCredentialResponse = async (response: any) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: response.credential }),
            });

            if (res.ok) {
                const data = await res.json();
                
                // Determine redirect path
                if (redirectParam) {
                    router.push(redirectParam);
                } else if (data.user.role === 'owner' || data.user.role === 'co_owner' || data.user.role === 'publisher') {
                    router.push('/dashboard');
                } else {
                    router.push('/');
                }
            } else {
                const data = await res.json().catch(() => ({}));
                const errorMessage = data.error || 'login_failed';
                setErrorMsg(errorMessage === 'Your account has been banned.' ? "You are banned, bitch!" : errorMessage);
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            setErrorMsg("An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!mounted) return;

        // Load the Google GSI script dynamically
        const scriptId = "google-gsi-client";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        const initializeGSI = () => {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
                return;
            }

            // @ts-ignore
            window.google?.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            const buttonDiv = document.getElementById("google-signin-button");
            if (buttonDiv) {
                // @ts-ignore
                window.google?.accounts.id.renderButton(buttonDiv, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                    logo_alignment: "left",
                    width: buttonDiv.clientWidth || 320,
                });
            }

            // Optionally prompt One Tap
            // @ts-ignore
            window.google?.accounts.id.prompt();
        };

        if (!script) {
            script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.id = scriptId;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
            script.onload = initializeGSI;
        } else {
            // @ts-ignore
            if (window.google) {
                initializeGSI();
            } else {
                script.onload = initializeGSI;
            }
        }

        return () => {
            // Cleanup one-tap overlay if user leaves the page
            // @ts-ignore
            window.google?.accounts.id.cancel();
        };
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to access your notes and dashboard.</p>
            </div>

            {errorMsg && (
                <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-500 text-sm font-bold rounded-xl max-w-sm w-full text-center">
                    {errorMsg}
                </div>
            )}

            <div className="p-8 border rounded-xl bg-card shadow-sm w-full max-w-sm flex flex-col items-center justify-center min-h-[140px]">
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-muted-foreground">Authenticating...</p>
                    </div>
                ) : (
                    <div 
                        id="google-signin-button" 
                        className="w-full flex justify-center min-h-[44px]"
                    ></div>
                )}
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
