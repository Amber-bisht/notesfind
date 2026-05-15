import redis from './redis';

/**
 * Redis-based Rate Limiter (Fixed Window)
 * @param key The unique key to track (usually IP or UserID)
 * @param limit Max number of requests allowed in the window
 * @param windowSeconds Window size in seconds
 * @returns Object containing whether they are limited and current count
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
    try {
        const fullKey = `rl:${key}`;
        const current = await redis.get(fullKey);
        const count = current ? parseInt(current) : 0;

        if (count >= limit) {
            return { limited: true, count };
        }

        const multi = redis.multi();
        multi.incr(fullKey);
        
        // Only set expiry if it's a new key
        if (count === 0) {
            multi.expire(fullKey, windowSeconds);
        }

        await multi.exec();

        return { limited: false, count: count + 1 };
    } catch (error) {
        console.error("[RateLimit] Redis error:", error);
        // Fallback: If redis is down, we allow the request to prevent locking out users
        return { limited: false, count: 0 };
    }
}
