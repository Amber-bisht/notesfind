import Redis from 'ioredis';

const redisClient = () => {
    // Default to docker-compose service name 'redis'
    const host = process.env.REDIS_HOST || 'redis';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    
    return new Redis({
        host,
        port,
        // Add a small timeout to prevent blocking the whole app if redis is down
        connectTimeout: 5000, 
    });
};

const globalForRedis = global as unknown as { redis: any };

export const redis = globalForRedis.redis || redisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
