import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.json({ user: null });
    }

    try {
        await dbConnect();
        const user = await User.findById(payload.userId)
            .select('-password')
            .populate({
                path: 'downloads.noteId',
                populate: {
                    path: 'subCategoryId',
                    populate: {
                        path: 'categoryId'
                    }
                }
            })
            .populate('joinedWebinars.webinarId');

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
                downloads: user.downloads,
                socials: user.socials,
                phone: user.phone,
                joinedWebinars: user.joinedWebinars,
            },
        });
    } catch {
        return NextResponse.json({ user: null });
    }
}
