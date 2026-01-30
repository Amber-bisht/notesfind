import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Webinar from '@/models/Webinar';
import User, { UserRole } from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params;

        const user = await User.findOne({ email: payload.email });

        if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.PUBLISHER)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const webinar = await Webinar.findById(id);

        if (!webinar) {
            return NextResponse.json({ success: false, error: 'Webinar not found' }, { status: 404 });
        }

        await webinar.deleteOne();

        return NextResponse.json({ success: true, message: 'Webinar deleted' }, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to delete webinar' },
            { status: 500 }
        );
    }
}
