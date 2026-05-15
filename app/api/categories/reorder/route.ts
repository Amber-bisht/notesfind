import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { verifyToken } from '@/lib/auth';

// Bulk reorder categories
export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || !['owner', 'co_owner'].includes(payload.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { order } = await req.json(); // array of { id, rank }

        if (!Array.isArray(order)) {
            return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
        }

        await dbConnect();

        // Use a large offset to avoid unique constraint clashes during reorder
        const offset = 100000;
        const bulkOps = [
            // First pass: set all ranks to offset + new rank (avoids clashes)
            ...order.map((item: { id: string; rank: number }) => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { rank: offset + item.rank } },
                },
            })),
            // Second pass: set to actual rank values
            ...order.map((item: { id: string; rank: number }) => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { rank: item.rank } },
                },
            })),
        ];

        await Category.bulkWrite(bulkOps);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
