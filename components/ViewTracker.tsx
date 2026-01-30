
"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
    id: string;
    type: "note" | "category" | "subcategory";
}

export function ViewTracker({ id, type }: ViewTrackerProps) {
    useEffect(() => {
        const incrementView = async () => {
            try {
                let endpoint = "";
                if (type === "note") endpoint = "/api/notes/view";
                else if (type === "category") endpoint = "/api/categories/view";
                else if (type === "subcategory") endpoint = "/api/subcategories/view";

                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });
            } catch (error) {
                console.error(`Failed to increment view for ${type}`, error);
            }
        };

        if (id) {
            incrementView();
        }
    }, [id, type]);

    return null;
}
