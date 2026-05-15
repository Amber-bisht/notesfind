import mongoose from 'mongoose';
import '@/models/Category';
import '@/models/SubCategory';
import '@/models/Note';
import '@/models/Request';
import '@/models/Contact';
import '@/models/User';
import '@/models/Webinar';
import '@/models/Service';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
     
    var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached!.conn) {
        return cached!.conn;
    }

    // BUILD OPTIMIZATION: Instant fail if we are in the build phase or using a placeholder
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI?.includes('mongodb+srv');
    
    if (isBuildPhase && !cached!.conn) {
        console.warn('=> Skipping DB connection instantly during build phase.');
        return null;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: isBuildPhase ? 1000 : 30000, // 1s timeout during build, 30s otherwise
        };

        cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        
        if (isBuildPhase) {
            console.warn('=> MongoDB connection failed during build phase. Pages will be dynamic.');
            return null;
        }
        throw e;
    }

    return cached!.conn;
}

export default dbConnect;
