import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Paths that require specific roles
    const isAdminPath = path.startsWith('/admin');
    const isDashboardPath = path.startsWith('/dashboard');

    if (isAdminPath || isDashboardPath) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        if (isAdminPath && payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url)); // Or unauthorized page
        }

        if (isDashboardPath && !['admin', 'publisher'].includes(payload.role)) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*'],
};
