import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { verboseGoogleAuth } from '@/lib/google-auth';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        const payload = await verboseGoogleAuth(code);

        if (!payload) {
            return NextResponse.json({ error: 'Invalid Google Code' }, { status: 401 });
        }

        const { email, name, picture } = payload;

        if (!email) {
            return NextResponse.json({ error: 'Email missing from Google Account' }, { status: 400 });
        }

        await dbConnect();

        // Find or Create User
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name: name || 'User',
                image: picture,
                role: UserRole.USER, // Default role
            });
        }

        // Generate JWT
        const token = await signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set Cookie
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
    }
}
