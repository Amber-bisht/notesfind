import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await dbConnect();
        
        // Fetch full user activity only when requested by the dashboard
        const user = await User.findById(payload.userId)
            .select('downloads joinedWebinars socials phone')
            .populate({
                path: 'downloads.noteId',
                populate: {
                    path: 'subCategoryId',
                    populate: { path: 'categoryId' }
                }
            })
            .populate('joinedWebinars.webinarId')
            .lean();

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({
            downloads: user.downloads || [],
            joinedWebinars: user.joinedWebinars || [],
            socials: user.socials || {},
            phone: user.phone || ""
        });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
