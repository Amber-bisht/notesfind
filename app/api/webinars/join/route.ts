import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

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

        const body = await req.json();
        const { webinarId, phone, jobTitle, age, country, district, organization } = body;

        if (!webinarId) {
            return NextResponse.json({ success: false, error: 'Webinar ID is required' }, { status: 400 });
        }

        const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
            $addToSet: {
                joinedWebinars: {
                    webinarId,
                    joinedAt: new Date()
                }
            }
        };

        const setFields: any = {};
        if (phone) setFields.phone = phone;
        if (jobTitle) setFields.jobTitle = jobTitle;
        if (age) setFields.age = age;
        if (country) setFields.country = country;
        if (district) setFields.district = district;
        if (organization) setFields.organization = organization;

        if (Object.keys(setFields).length > 0) {
            updateData.$set = setFields;
        }

        await User.findOneAndUpdate(
            { email: payload.email },
            updateData,
            { new: true }
        );

        return NextResponse.json({ success: true, message: 'Joined successfully' }, { status: 200 });
    } catch (error) {
        console.error("Join webinar error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to join webinar' },
            { status: 500 }
        );
    }
}
