"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
    className?: string;
    variant?: "header" | "footer";
}

export function Logo({ className, variant }: LogoProps) {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Default to black logo for SSR
    if (!mounted) {
        return (
            <div className={cn("relative", className)}>
                <Image
                    src="/logo-black.png"
                    alt="NotesFind"
                    width={500}
                    height={200}
                    className="w-auto h-full object-contain"
                    priority
                />
            </div>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <div className={cn("relative", className)}>
            <Image
                src={isDark ? "/logo-white.png" : "/logo-black.png"}
                alt="NotesFind"
                width={500}
                height={200}
                className="w-auto h-full object-contain"
                priority
            />
        </div>
    );
}



