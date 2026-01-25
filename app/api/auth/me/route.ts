import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ user: null });
    }

    const payload = verifyToken(token);

    if (!payload) {
        return NextResponse.json({ user: null });
    }

    try {
        await dbConnect();
        const user = await User.findById(payload.userId).select('-password'); // No password field anyway, but good practice

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
            },
        });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}
