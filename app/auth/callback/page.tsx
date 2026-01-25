"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const processedRef = useRef(false);

    useEffect(() => {
        if (!code || processedRef.current) return;

        processedRef.current = true;

        async function exchangeCode() {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                });

                if (res.ok) {
                    const data = await res.json();
                    // Check role to redirect
                    if (data.user.role === 'admin') {
                        router.push('/admin');
                    } else if (data.user.role === 'publisher') {
                        router.push('/dashboard');
                    } else {
                        router.push('/');
                    }
                } else {
                    console.error('Login failed');
                    router.push('/auth?error=login_failed');
                }
            } catch (error) {
                console.error('Login error', error);
                router.push('/auth?error=login_error');
            }
        }

        exchangeCode();
    }, [code, router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Authenticating...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
