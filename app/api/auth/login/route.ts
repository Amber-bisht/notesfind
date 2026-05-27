import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { verboseGoogleAuth, verifyGoogleToken } from '@/lib/google-auth';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import { cookies } from 'next/headers';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
    try {
        const { code, idToken } = await req.json();

        if (!code && !idToken) {
            return NextResponse.json({ error: 'Missing code or idToken' }, { status: 400 });
        }

        let payload;
        if (idToken) {
            payload = await verifyGoogleToken(idToken);
        } else {
            const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/auth/callback`;
            payload = await verboseGoogleAuth(code!, redirectUri);
        }

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

        if (user.isBanned) {
            return NextResponse.json({ error: 'Your account has been banned.' }, { status: 403 });
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

        // Log Login
        await createAuditLog(user._id.toString(), {
            action: 'login',
            details: `User logged in: ${user.email}`,
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
