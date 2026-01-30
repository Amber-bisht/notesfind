import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import User from '@/models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
    userId: string;
}

// Helper to verify admin/publisher access
async function verifyAdminOrPublisher(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        await dbConnect();
        const user = await User.findById(decoded.userId);
        return user && ['admin', 'publisher'].includes(user.role);
    } catch {
        return false;
    }
}

// Helper for Turnstile Verification
async function verifyTurnstile(token: string) {
    const secretKey = process.env.CLOUDFLARE_SECRET_KEY;
    if (!secretKey) return false; // Fail open or closed? Closed for security.

    try {
        const formData = new FormData();
        formData.append('secret', secretKey);
        formData.append('response', token);

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const outcome = await result.json();
        return outcome.success;
    } catch (e) {
        console.error('Turnstile verification error:', e);
        return false;
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        // Verify User
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Please log in to submit a request.' },
                { status: 401 }
            );
        }

        let user;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
            user = await User.findById(decoded.userId);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid token. Please log in again.' },
                { status: 401 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found.' },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { message, cfToken } = body;

        if (!cfToken) {
            return NextResponse.json(
                { success: false, error: 'Please complete the CAPTCHA.' },
                { status: 400 }
            );
        }

        const isCaptchaValid = await verifyTurnstile(cfToken);
        if (!isCaptchaValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid CAPTCHA. Please try again.' },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { success: false, error: 'Please provide a message' },
                { status: 400 }
            );
        }

        const request = await Request.create({
            name: user.name,
            email: user.email,
            message,
        });

        return NextResponse.json({ success: true, data: request }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const isAuthorized = await verifyAdminOrPublisher(req);

        if (!isAuthorized) {
            return NextResponse.json(
                { success: false, error: 'Not authorized' },
                { status: 401 }
            );
        }

        const requests = await Request.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, count: requests.length, requests });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Server Error' },
            { status: 500 }
        );
    }
}
