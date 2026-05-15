import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';

import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const session = await verifyToken(token);
        if (!session || !['owner', 'co_owner'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;
        const role = searchParams.get('role');

        await dbConnect();

        const query = role ? { role: role as UserRole } : {};

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin users API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const session = await verifyToken(token);
        // Owner and Co-owner can manage roles
        if (!session || !['owner', 'co_owner'].includes(session.role as string)) {
            return NextResponse.json({ error: 'Only Owner or Co-Owner can manage roles' }, { status: 403 });
        }

        const body = await req.json();
        const { userId, role, assignedCategories, webinarAccess } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await dbConnect();

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Block assigning 'owner' role via API — owner can only be set manually in DB
        if (role === 'owner') {
            return NextResponse.json({ error: 'Owner role cannot be assigned via API' }, { status: 403 });
        }

        const oldRole = targetUser.role;

        // Prevent changing an existing owner's role
        if (targetUser.role === 'owner') {
            return NextResponse.json({ error: 'Cannot modify an Owner via API' }, { status: 403 });
        }

        if (role) targetUser.role = role;
        if (assignedCategories) targetUser.assignedCategories = assignedCategories;
        if (webinarAccess !== undefined) targetUser.webinarAccess = webinarAccess;

        await targetUser.save();

        // Log the change
        await createAuditLog(session.userId as string, {
            action: 'role_change',
            details: `Owner ${session.email} changed ${targetUser.email} role from ${oldRole} to ${role || oldRole}${assignedCategories ? ' and updated categories' : ''}`,
            targetId: targetUser._id as string,
            metadata: { oldRole, newRole: role, assignedCategories }
        });

        return NextResponse.json({ message: 'User updated successfully', user: targetUser });
    } catch (error) {
        console.error('Admin users update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
