import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Paths that require specific roles
    const isAdminPath = path.startsWith('/admin');
    const isPublishPath = path.startsWith('/publish');
    const isDashboardPath = path.startsWith('/dashboard');

    if (isAdminPath || isDashboardPath || isPublishPath) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        if (isAdminPath && payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (isPublishPath && !['admin', 'publisher'].includes(payload.role)) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // isDashboardPath check removed as it is now open to all authenticated users
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/publish/:path*'],
};
