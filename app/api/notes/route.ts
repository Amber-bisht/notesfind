import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const subCategoryId = searchParams.get('subCategoryId');
    const authorId = searchParams.get('authorId');

    try {
        const query: any = {};
        if (subCategoryId) query.subCategoryId = subCategoryId;
        if (authorId) query.authorId = authorId;

        const notes = await Note.find(query).populate('authorId', 'name image').populate('subCategoryId', 'name slug').sort({ createdAt: -1 });
        return NextResponse.json({ notes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only Admin and Publisher can create notes
        if (![UserRole.ADMIN, UserRole.PUBLISHER].includes(payload.role as UserRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        // Assign authorId from token
        body.authorId = payload.userId;

        await dbConnect();
        const note = await Note.create(body);

        return NextResponse.json({ note }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Note slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
