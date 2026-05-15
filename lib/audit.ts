import dbConnect from './db';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

import { headers } from 'next/headers';

export interface AuditLogData {
    action: string;
    details: string;
    targetId?: string | mongoose.Types.ObjectId;
    metadata?: Record<string, unknown>;
    ip?: string;
    browser?: string;
    country?: string;
    countryCode?: string;
}

export async function createAuditLog(
    userId: string | mongoose.Types.ObjectId,
    data: AuditLogData
) {
    try {
        await dbConnect();

        // If networking data not provided, try to get from headers (Cloudflare)
        let { ip, browser, country, countryCode } = data;

        if (!ip || !country) {
            const headerList = await headers();
            ip = ip || headerList.get('cf-connecting-ip') || headerList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
            country = country || headerList.get('cf-ipcountry') || 'unknown';
            countryCode = countryCode || headerList.get('cf-ipcountry') || 'unknown';
            browser = browser || headerList.get('user-agent') || 'unknown';
        }

        await AuditLog.create({
            userId,
            action: data.action,
            details: data.details,
            targetId: data.targetId,
            metadata: data.metadata,
            ip,
            browser,
            country,
            countryCode
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}
