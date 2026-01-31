import dbConnect from './db';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

export async function createAuditLog(
    userId: string | mongoose.Types.ObjectId,
    action: string,
    details: string,
    targetId?: string | mongoose.Types.ObjectId,
    metadata?: Record<string, unknown>
) {
    try {
        await dbConnect();
        await AuditLog.create({
            userId,
            action,
            details,
            targetId,
            metadata
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}
