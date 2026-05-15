import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Webinar from '@/models/Webinar';
import User, { UserRole } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    await dbConnect();

    try {
        const webinars = await Webinar.find({}).sort({ timestamp: 1 }).populate('createdBy', 'name email');

        return NextResponse.json({ success: true, webinars }, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch webinars' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: payload.email });

        if (!user || !['owner', 'co_owner', 'publisher'].includes(user.role as string)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { image, title, description, longDescription, timestamp, link, type, venue, address, mapLink } = body;

        // Check webinar access for non-owners
        if (user.role !== 'owner') {
            const access = user.webinarAccess || 'none';
            if (access === 'none') {
                return NextResponse.json({ success: false, error: 'You do not have webinar management access' }, { status: 403 });
            }
            const webinarType = type || 'online';
            if (access !== 'both' && access !== webinarType) {
                return NextResponse.json({ success: false, error: `You only have access to ${access} webinars` }, { status: 403 });
            }
        }

        if (!image || !title || !description || !timestamp) {
            return NextResponse.json(
                { success: false, error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        if (type === 'online' && !link) {
            return NextResponse.json({ success: false, error: 'Link is required for online webinars' }, { status: 400 });
        }

        if (type === 'offline' && (!venue || !address)) {
            return NextResponse.json({ success: false, error: 'Venue and Address are required for offline events' }, { status: 400 });
        }

        const webinar = await Webinar.create({
            image,
            title,
            description,
            longDescription,
            timestamp,
            link,
            type: type || 'online',
            venue,
            address,
            mapLink,
            createdBy: user._id,
        });

        return NextResponse.json({ success: true, webinar }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to create webinar' },
            { status: 500 }
        );
    }
}
