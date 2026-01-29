import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(_req: NextRequest) {
    try {
        await dbConnect();
        const services = await Service.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ services }, { status: 200 });
    } catch (error) {
        console.error("Fetch services error:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        const service = await Service.create(body);

        return NextResponse.json({ service }, { status: 201 });
    } catch (error) {
        console.error("Create service error:", error);
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}
