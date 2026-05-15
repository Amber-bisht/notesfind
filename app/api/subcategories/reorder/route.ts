import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubCategory from '@/models/SubCategory';
import { verifyToken } from '@/lib/auth';

// Bulk reorder subcategories
export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || !['owner', 'co_owner', 'publisher'].includes(payload.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { order } = await req.json();

        if (!Array.isArray(order)) {
            return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
        }

        await dbConnect();

        const offset = 100000;
        const bulkOps = [
            ...order.map((item: { id: string; rank: number }) => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { rank: offset + item.rank } },
                },
            })),
            ...order.map((item: { id: string; rank: number }) => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { rank: item.rank } },
                },
            })),
        ];

        await SubCategory.bulkWrite(bulkOps);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
