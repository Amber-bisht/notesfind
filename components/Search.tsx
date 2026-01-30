"use client";

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchItem {
    id: string;
    name: string;
    type: 'category' | 'subcategory';
    slug: string;
    parentSlug?: string;
}

export function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchItem[]>([]);
    const [index, setIndex] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, subRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/subcategories')
                ]);

                const catData = await catRes.json();
                const subData = await subRes.json();

                const items: SearchItem[] = [];

                if (catData.categories) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    catData.categories.forEach((cat: any) => {
                        items.push({
                            id: cat._id,
                            name: cat.name,
                            type: 'category',
                            slug: cat.slug
                        });
                    });
                }

                if (subData.subCategories) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    subData.subCategories.forEach((sub: any) => {
                        if (sub.categoryId) {
                            items.push({
                                id: sub._id,
                                name: sub.name,
                                type: 'subcategory',
                                slug: sub.slug,
                                parentSlug: sub.categoryId.slug
                            });
                        }
                    });
                }

                setIndex(items);
            } catch (error) {
                console.error("Failed to load search index", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();
        const filtered = index.filter(item =>
            item.name.toLowerCase().includes(normalizedQuery)
        ).slice(0, 10); // Limit to 10 results

        setResults(filtered);
    }, [query, index]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            (e.target as HTMLInputElement).blur();
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    className="w-full h-10 pl-10 pr-10 rounded-full border border-input bg-background/50 hover:bg-background focus:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="Search topics..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && query.trim() && (
                <div className="absolute top-full mt-2 w-full bg-popover text-popover-foreground rounded-xl border shadow-lg overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200">
                    {results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Results
                            </div>
                            {results.map((item) => {
                                const href = item.type === 'category'
                                    ? `/${item.slug}`
                                    : `/${item.parentSlug}/${item.slug}`;

                                return (
                                    <Link
                                        key={item.id}
                                        href={href}
                                        onClick={clearSearch}
                                        className="flex items-center px-4 py-2 hover:bg-muted/50 transition-colors text-sm group"
                                    >
                                        <div className="flex-1">
                                            <span className="font-medium group-hover:text-primary transition-colors">{item.name}</span>
                                            <span className="ml-2 text-xs text-muted-foreground border px-1.5 py-0.5 rounded-full capitalize">
                                                {item.type}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
