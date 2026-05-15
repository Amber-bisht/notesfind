import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import User from '@/models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
    userId: string;
}

async function verifyTurnstile(token: string) {
    const secretKey = process.env.CLOUDFLARE_SECRET_KEY;
    if (!secretKey) return false;

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
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let user;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
            user = await User.findById(decoded.userId);
        } catch {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const { message, referenceLink, tag, cfToken } = body;

        if (!cfToken) {
            return NextResponse.json({ success: false, error: 'CAPTCHA missing' }, { status: 400 });
        }

        const isCaptchaValid = await verifyTurnstile(cfToken);
        if (!isCaptchaValid) {
            return NextResponse.json({ success: false, error: 'Invalid CAPTCHA' }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        const contact = await Contact.create({
            name: user.name,
            email: user.email,
            message,
            referenceLink,
            tag: tag || 'General',
        });

        return NextResponse.json({ success: true, data: contact }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message || 'Server Error' }, { status: 500 });
    }
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

        const contacts = await Contact.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, count: contacts.length, contacts });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Server Error' },
            { status: 500 }
        );
    }
}
