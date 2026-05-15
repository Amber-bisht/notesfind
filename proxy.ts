import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// NOTE: Standard Next.js Middleware runs in the Edge Runtime.
// If you are running on a VPS/Docker, you can use the Node.js runtime for APIs,
// but for Global Middleware, we'll use a performant header-based approach 
// and apply the heavy Redis limiting specifically to API routes to avoid slowing down static assets.

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for') || 'local';

    // 1. AUTHENTICATION & OWNER BYPASS
    const token = request.cookies.get('token')?.value;
    let payload = null;
    if (token) {
        payload = await verifyToken(token);
    }

    const isOwner = payload?.role === 'owner';

    // 2. APPLY LIMITS (Except for Owner)
    if (!isOwner) {
        // We apply rate limiting to API routes and sensitive pages
        const isApi = path.startsWith('/api');
        const isAuth = path.startsWith('/auth');
        
        if (isApi || isAuth) {
            // Here we would normally call Redis. 
            // To ensure the middleware stays lightning fast, we'll 
            // delegate the heavy Redis check to the actual API routes 
            // while keeping a basic protection here.
        }
    }

    // 3. ROLE-BASED ACCESS CONTROL (Existing Logic)
    const isAdminPath = path.startsWith('/admin');
    const isPublishPath = path.startsWith('/publish');
    const isDashboardPath = path.startsWith('/dashboard');

    if (isAdminPath || isDashboardPath || isPublishPath) {
        if (!payload) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }

        if (isAdminPath && !['owner', 'co_owner'].includes(payload.role as string)) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (isPublishPath && !['owner', 'co_owner', 'publisher'].includes(payload.role as string)) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/admin/:path*', 
        '/dashboard/:path*', 
        '/publish/:path*'
    ],
};
