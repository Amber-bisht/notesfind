import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;

        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifyToken(token);
        if (!session || !['owner', 'co_owner', 'publisher'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { subject, replyMessage } = await req.json();

        if (!subject || !replyMessage) {
            return NextResponse.json({ error: 'Subject and Reply Message are required' }, { status: 400 });
        }

        await dbConnect();
        const contact = await Contact.findById(id);

        if (!contact) {
            return NextResponse.json({ error: 'Contact message not found' }, { status: 404 });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            return NextResponse.json({ 
                error: 'RESEND_API_KEY is not configured in .env.local. Please add it to enable email replies.' 
            }, { status: 500 });
        }

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Notesfind <onboarding@resend.dev>';

        // Send email via Resend API
        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [contact.email],
                subject: subject,
                text: replyMessage,
            }),
        });

        if (!emailRes.ok) {
            const errorData = await emailRes.json().catch(() => ({}));
            console.error('Resend API Error:', errorData);
            return NextResponse.json({ 
                error: errorData.message || 'Failed to send email via Resend' 
            }, { status: 500 });
        }

        // Save reply state to DB
        contact.replied = true;
        contact.repliedAt = new Date();
        contact.replyMessage = replyMessage;
        await contact.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Reply sent successfully', 
            contact 
        });

    } catch (error) {
        console.error('Contact reply error:', error);
        return NextResponse.json({ 
            error: (error as Error).message || 'Internal server error' 
        }, { status: 500 });
    }
}
