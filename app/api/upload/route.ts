import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const payload = token ? await verifyToken(token) : null;

        // Only authenticated users (Admin/Publisher?) should probably upload images.
        // Assuming Admin for Category/SubCategory images for now as per requirements context (usually admin setups categories)
        // But if regular users upload notes with images, they might need access too if we reuse this.
        // For now, let's restrict to Admin/Publisher to be safe, or just check if logged in.
        // The prompt implies "user will upload any image", suggesting maybe end users too?
        // But Categories/Subcategories are usually Admin managed.
        // Notes can be created by Admin/Publisher.
        // Let's stick to Admin/Publisher for now.

        if (!payload || ![UserRole.ADMIN, UserRole.PUBLISHER].includes(payload.role as UserRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const url = await uploadImage(file);

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: (error as Error).message || 'Upload failed' }, { status: 500 });
    }
}
