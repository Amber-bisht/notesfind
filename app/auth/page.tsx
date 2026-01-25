"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGoogleLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'; // Ideally from env
        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
        const scope = 'openid email profile';
        const responseType = 'code';

        // Check if we have env var, if not show alert (for dev)
        if (clientId === 'YOUR_CLIENT_ID') {
            alert('Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local');
            return;
        }

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&access_type=offline&prompt=consent`;

        window.location.href = authUrl;
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to access your notes and dashboard.</p>
            </div>

            <div className="p-8 border rounded-xl bg-card shadow-sm w-full max-w-sm">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
