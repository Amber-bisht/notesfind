"use client";

import { useEffect, useState } from "react";
import { Download, Lock } from "lucide-react";

interface NotePDFButtonProps {
    contentRef?: React.RefObject<HTMLElement | null>;
    noteTitle: string;
    noteId: string;
    noteSlug: string;
}

interface User {
    email: string;
    [key: string]: unknown;
}

export function NotePDFButton({ noteTitle, noteId, noteSlug }: NotePDFButtonProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load user
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(() => setUser(null));
    }, []);

    const handleDownload = () => {
        if (!user) return;
        setLoading(true);

        // Redirect to backend PDF generation endpoint
        window.location.href = `/api/notes/${noteId}/pdf`;

        // Reset loading status after a short delay (once the download starts in the background)
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    };

    if (!user) {
        return (
            <button disabled className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-muted text-muted-foreground px-4 py-2 cursor-not-allowed opacity-70">
                <Lock className="w-4 h-4 mr-2" /> Login to Download PDF
            </button>
        );
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 transition-colors disabled:opacity-50"
        >
            {loading ? (
                <>Generating PDF...</>
            ) : (
                <>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </>
            )}
        </button>
    );
}
