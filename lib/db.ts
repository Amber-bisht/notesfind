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

function isURLEncoded(str: string): boolean {
    try {
        return str !== decodeURIComponent(str);
    } catch {
        return false;
    }
}

function getSafeMongoURI(uri: string): string {
    if (!uri) return uri;
    
    const protocolMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)/);
    if (!protocolMatch) return uri;
    
    const protocol = protocolMatch[1];
    const rest = uri.slice(protocol.length);
    
    const firstSlashIndex = rest.indexOf('/');
    const hostPathPart = firstSlashIndex !== -1 ? rest.slice(firstSlashIndex) : '';
    const credentialsAndHostPart = firstSlashIndex !== -1 ? rest.slice(0, firstSlashIndex) : rest;
    
    const lastAtIndex = credentialsAndHostPart.lastIndexOf('@');
    if (lastAtIndex === -1) {
        return uri;
    }
    
    const credentialsPart = credentialsAndHostPart.slice(0, lastAtIndex);
    const hostPart = credentialsAndHostPart.slice(lastAtIndex + 1);
    
    const firstColonIndex = credentialsPart.indexOf(':');
    let username = credentialsPart;
    let password = '';
    
    if (firstColonIndex !== -1) {
        username = credentialsPart.slice(0, firstColonIndex);
        password = credentialsPart.slice(firstColonIndex + 1);
    }
    
    const safeUsername = isURLEncoded(username) ? username : encodeURIComponent(username);
    const safePassword = isURLEncoded(password) ? password : encodeURIComponent(password);
    
    const credentialsString = password ? `${safeUsername}:${safePassword}` : safeUsername;
    return `${protocol}${credentialsString}@${hostPart}${hostPathPart}`;
}

async function dbConnect() {
    if (cached!.conn) {
        return cached!.conn;
    }

    // BUILD OPTIMIZATION: Instant fail if we are in the build phase or using a placeholder
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.MONGODB_URI?.includes('unused_during_build');
    
    if (isBuildPhase && !cached!.conn) {
        console.warn('=> Skipping DB connection instantly during build phase.');
        return null;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: isBuildPhase ? 1000 : 30000, // 1s timeout during build, 30s otherwise
        };

        const safeURI = getSafeMongoURI(MONGODB_URI!);
        cached!.promise = mongoose.connect(safeURI, opts).then((mongoose) => {
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
