"use client";

import { useEffect, useState } from "react";
import { Download, Lock } from "lucide-react";

interface NotePDFButtonProps {
    contentRef: React.RefObject<HTMLElement | null>;
    noteTitle: string;
    noteId: string;
    noteSlug: string;
}

export function NotePDFButton({ contentRef, noteTitle, noteId, noteSlug }: NotePDFButtonProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [html2pdf, setHtml2pdf] = useState<any>(null);

    useEffect(() => {
        // Load user
        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(() => setUser(null));

        // Dynamic import html2pdf (client-side only)
        import("html2pdf.js").then(module => {
            setHtml2pdf(() => module.default);
        });
    }, []);

    const trackDownload = async () => {
        try {
            await fetch("/api/user/downloads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId, slug: noteSlug }),
            });
        } catch (error) {
            console.error("Failed to track download", error);
        }
    };

    const handleDownload = async () => {
        if (!user || !html2pdf || !contentRef.current) return;
        setLoading(true);

        // Track download
        trackDownload();

        const element = contentRef.current;

        // Create Watermark Overlay
        const watermarkDiv = document.createElement('div');
        watermarkDiv.style.position = 'fixed';
        watermarkDiv.style.top = '0';
        watermarkDiv.style.left = '0';
        watermarkDiv.style.width = '100%';
        watermarkDiv.style.height = '100%';
        watermarkDiv.style.zIndex = '-1'; // Behind text but visible if background transparent
        watermarkDiv.style.pointerEvents = 'none';
        watermarkDiv.style.display = 'flex';
        watermarkDiv.style.flexDirection = 'column';
        watermarkDiv.style.justifyContent = 'center';
        watermarkDiv.style.alignItems = 'center';
        watermarkDiv.style.opacity = '0.1'; // Faint
        watermarkDiv.style.overflow = 'hidden';

        // Add User Email Repeatedly pattern or single large
        // Let's do a pattern for better security
        const emailPattern = document.createElement('div');
        emailPattern.style.transform = 'rotate(-45deg)';
        emailPattern.style.fontSize = '24px';
        emailPattern.style.fontWeight = 'bold';
        emailPattern.style.color = '#000';
        emailPattern.style.textAlign = 'center';
        emailPattern.style.lineHeight = '4rem';

        // Repeat email many times
        let watermarkText = "";
        for (let i = 0; i < 50; i++) {
            watermarkText += `${user.email} • NotesFind • ${user.email} • NotesFind <br/> `;
        }
        emailPattern.innerHTML = watermarkText;

        watermarkDiv.appendChild(emailPattern);
        element.appendChild(watermarkDiv);
        element.style.position = 'relative'; // Ensure relative context

        const opt = {
            margin: 10,
            filename: `${noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF");
        } finally {
            // Cleanup
            if (watermarkDiv.parentNode === element) {
                element.removeChild(watermarkDiv);
            }
            setLoading(false);
        }
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
            disabled={loading || !html2pdf}
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
