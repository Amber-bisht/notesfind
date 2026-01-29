"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface Service {
    _id: string;
    title: string;
    description: string;
    price: number;
    image: string;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center">Loading services...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-8">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Professional Services</h1>
                <p className="text-xl text-muted-foreground">
                    Accelerate your growth with our tailored services and mentorship programs.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                    <div key={service._id} className="border rounded-2xl bg-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                        {/* Image Header */}
                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                            {service.image ? (
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-primary/5 text-primary text-lg font-bold">
                                    Premium Service
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <p className="font-bold text-2xl">${service.price}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col space-y-4">
                            <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed flex-1">
                                {service.description}
                            </p>

                            <div className="pt-4 mt-auto">
                                <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {services.length === 0 && (
                    <div className="col-span-full text-center py-24 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed">
                        <p className="text-lg">No services listed at the moment.</p>
                        <p>Check back later for updates!</p>
                    </div>
                )}
            </div>

            {/* Trust/Process Section */}
            <div className="grid md:grid-cols-3 gap-8 pt-12 border-t">
                <div className="flex flex-col items-center text-center space-y-2 p-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Expert Vetted</h3>
                    <p className="text-sm text-muted-foreground">All services are provided by verified industry professionals.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2 p-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Secure Transactions</h3>
                    <p className="text-sm text-muted-foreground">Your payments and data are always 100% secure.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2 p-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Quality Guaranteed</h3>
                    <p className="text-sm text-muted-foreground">Satisfaction guaranteed with our premium support.</p>
                </div>
            </div>
        </div>
    );
}
