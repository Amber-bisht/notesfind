import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Webinar from "@/models/Webinar";
import WebinarClient from "./WebinarClient";

// Re-validate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
    await dbConnect();
    const webinars = await Webinar.find({}, { _id: 1 }).lean();
    return webinars.map((webinar) => ({
        id: webinar._id.toString(),
    }));
}

async function getWebinar(id: string) {
    await dbConnect();
    const webinar = await Webinar.findById(id).populate('createdBy', 'name email').lean();
    if (!webinar) return null;
    return JSON.parse(JSON.stringify(webinar));
}

export default async function WebinarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const webinar = await getWebinar(id);

    if (!webinar) {
        notFound();
    }

    return <WebinarClient webinar={webinar} />;
}
