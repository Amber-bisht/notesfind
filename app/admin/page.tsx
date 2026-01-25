"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function AdminDashboard() {
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");

    // Forms
    const [catName, setCatName] = useState("");
    const [catSlug, setCatSlug] = useState("");
    const [subName, setSubName] = useState("");
    const [subSlug, setSubSlug] = useState("");
    const [selectedCatId, setSelectedCatId] = useState("");

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
    };

    const fetchSubCategories = async () => {
        const res = await fetch("/api/subcategories");
        const data = await res.json();
        setSubCategories(data.subCategories || []);
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/categories", {
            method: "POST",
            body: JSON.stringify({ name: catName, slug: catSlug }),
        });
        if (res.ok) {
            setCatName("");
            setCatSlug("");
            fetchCategories();
        } else {
            alert("Failed to create category");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) fetchCategories();
    };

    const handleCreateSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/subcategories", {
            method: "POST",
            body: JSON.stringify({ name: subName, slug: subSlug, categoryId: selectedCatId }),
        });
        if (res.ok) {
            setSubName("");
            setSubSlug("");
            setSelectedCatId("");
            fetchSubCategories();
        } else {
            alert("Failed to create sub-category");
        }
    };

    const handleDeleteSubCategory = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
        if (res.ok) fetchSubCategories();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "categories"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Categories
                </button>
                <button
                    onClick={() => setActiveTab("subcategories")}
                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "subcategories"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Sub-Categories
                </button>
            </div>

            {activeTab === "categories" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Existing Categories</h2>
                        <div className="rounded-md border bg-card">
                            {categories.map((cat) => (
                                <div key={cat._id} className="flex items-center justify-between p-4 border-b last:border-0">
                                    <div>
                                        <h3 className="font-medium">{cat.name}</h3>
                                        <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                                    </div>
                                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && <p className="p-4 text-center text-muted-foreground">No categories yet.</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Add Category</h2>
                        <form onSubmit={handleCreateCategory} className="space-y-4 p-4 border rounded-xl bg-card">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Slug</label>
                                <input
                                    type="text"
                                    value={catSlug}
                                    onChange={(e) => setCatSlug(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                <Plus className="w-4 h-4 mr-2" /> Create Category
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "subcategories" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Existing Sub-Categories</h2>
                        <div className="rounded-md border bg-card">
                            {subCategories.map((sub) => (
                                <div key={sub._id} className="flex items-center justify-between p-4 border-b last:border-0">
                                    <div>
                                        <h3 className="font-medium">{sub.name}</h3>
                                        <p className="text-xs text-muted-foreground">/{sub.slug} <span className="opacity-50">• {sub.categoryId?.name}</span></p>
                                    </div>
                                    <button onClick={() => handleDeleteSubCategory(sub._id)} className="text-destructive hover:bg-destructive/10 p-2 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {subCategories.length === 0 && <p className="p-4 text-center text-muted-foreground">No sub-categories yet.</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Add Sub-Category</h2>
                        <form onSubmit={handleCreateSubCategory} className="space-y-4 p-4 border rounded-xl bg-card">
                            <div>
                                <label className="text-sm font-medium">Parent Category</label>
                                <select
                                    value={selectedCatId}
                                    onChange={(e) => setSelectedCatId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={subName}
                                    onChange={(e) => setSubName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Slug</label>
                                <input
                                    type="text"
                                    value={subSlug}
                                    onChange={(e) => setSubSlug(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                <Plus className="w-4 h-4 mr-2" /> Create Sub-Category
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
