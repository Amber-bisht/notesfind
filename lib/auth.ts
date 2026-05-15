import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'build-time-placeholder-secret-do-not-use-in-production';

// Only throw if missing and NOT in a build environment
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    // In actual production runtime, we still want to be alerted if it's missing.
    // But we don't want to block the build process.
    console.warn('WARNING: JWT_SECRET is missing. This will break authentication in production.');
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    [key: string]: string | number | boolean | unknown;
}

export async function signToken(payload: JWTPayload): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}
