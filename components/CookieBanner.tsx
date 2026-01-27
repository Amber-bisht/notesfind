"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 p-6 bg-card border shadow-xl rounded-xl animate-in slide-in-from-bottom duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h3 className="font-bold text-lg">Cookies & Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                        We use cookies to ensure you get the best experience on our website.
                    </p>
                </div>
                <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    onClick={acceptCookies}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Accept
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Decline
                </button>
            </div>
        </div>
    );
}
