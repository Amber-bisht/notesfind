"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Image as ImageIcon, DollarSign } from "lucide-react";

interface Service {
    _id: string;
    title: string;
    description: string;
    price: number;
    image: string;
}

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/services");
            const data = await res.json();
            setServices(data.services || []);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.url;
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            alert("Upload failed: " + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await handleUpload(file);
        if (url) setImage(url);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    image,
                }),
            });

            if (res.ok) {
                setIsCreating(false);
                setTitle("");
                setDescription("");
                setPrice("");
                setImage("");
                fetchServices();
            } else {
                alert("Failed to create service");
            }
        } catch (error) {
            console.error("Error creating service:", error);
            alert("Error creating service");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchServices();
            } else {
                alert("Failed to delete");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading services...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manage Services</h1>
                    <p className="text-muted-foreground">Add or remove services visible to users</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Service
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="border p-6 rounded-xl bg-card shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">New Service Details</h2>
                        <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-muted rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Service Title</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="e.g. 1-on-1 Mentorship"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 py-2 text-sm"
                                        placeholder="99.99"
                                    />
                                </div>
                            </div>
                            <div className="col-span-full space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Detailed description of the service..."
                                />
                            </div>
                            <div className="col-span-full space-y-2">
                                <label className="text-sm font-medium">Cover Image</label>
                                <div className="flex items-center gap-4">
                                    {image && (
                                        <div className="w-32 h-20 relative rounded-md overflow-hidden border">
                                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <label className="flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-muted transition-colors">
                                        <ImageIcon className="w-4 h-4" />
                                        {uploading ? "Uploading..." : "Upload Image"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-primary text-primary-foreground px-8 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                            >
                                Publish Service
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service._id} className="border rounded-xl bg-card overflow-hidden flex flex-col group">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                            {service.image ? (
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-primary/10 text-primary font-medium">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                                ${service.price}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{service.description}</p>
                            <button
                                onClick={() => handleDelete(service._id)}
                                className="flex items-center justify-center gap-2 w-full py-2 border border-destructive/20 text-destructive bg-destructive/5 rounded-md hover:bg-destructive/10 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Service
                            </button>
                        </div>
                    </div>
                ))}
                {services.length === 0 && !isCreating && (
                    <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        No services found. create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
