
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Webinar from '@/models/Webinar';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'publisher')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const webinar = await Webinar.findById(id);
        if (!webinar) {
            return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
        }

        // Find users who joined this webinar
        const attendees = await User.find({
            "joinedWebinars.webinarId": id
        }).lean();

        // CSV Header
        const headers = ['Name', 'Email', 'Phone', 'Job Title', 'Age', 'Country', 'District', 'Organization', 'Joined At'];

        // Define basic interface for attendee to avoid any
        interface Attendee {
            name: string;
            email: string;
            phone?: string;
            jobTitle?: string;
            age?: number;
            country?: string;
            district?: string;
            organization?: string;
            joinedWebinars: { webinarId: string | { toString: () => string }; joinedAt: Date | string }[];
        }

        const rows = (attendees as unknown as Attendee[]).map((attendee) => {
            const joinedInfo = attendee.joinedWebinars.find((jw) => jw.webinarId.toString() === id);
            const joinedAt = joinedInfo ? new Date(joinedInfo.joinedAt).toLocaleString() : 'N/A';

            // Handle potentially missing fields or commas in text
            const escape = (text: string | number | undefined) => {
                const val = text ? String(text) : '';
                return `"${val.replace(/"/g, '""')}"`; // Escape double quotes
            };

            return [
                escape(attendee.name),
                escape(attendee.email),
                escape(attendee.phone),
                escape(attendee.jobTitle),
                escape(attendee.age),
                escape(attendee.country),
                escape(attendee.district),
                escape(attendee.organization),
                escape(joinedAt)
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="attendees-${webinar.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
