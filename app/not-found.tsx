import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="space-y-6">
                {/* Animated 404 Text */}
                <h1 className="text-9xl font-black text-primary/10 tracking-tighter select-none animate-pulse">
                    404
                </h1>

                <div className="space-y-4 relative -top-12">
                    <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Page not found
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground text-lg">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4 relative -top-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <MoveLeft className="h-4 w-4" />
                        Go back home
                    </Link>
                    <Link
                        href="/community"
                        className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-8 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95"
                    >
                        Help Center
                    </Link>
                </div>
            </div>
        </div>
    );
}
