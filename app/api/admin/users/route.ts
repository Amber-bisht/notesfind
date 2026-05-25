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
        // Only Owner can manage users
        if (!session || session.role !== 'owner') {
            return NextResponse.json({ error: 'Only Owner can manage users' }, { status: 403 });
        }

        const body = await req.json();
        const {
            userId,
            role,
            assignedCategories,
            webinarAccess,
            name,
            email,
            phone,
            jobTitle,
            age,
            country,
            district,
            organization,
            socials,
            isBanned
        } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await dbConnect();

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent changing an existing owner's role or modifying an Owner
        if (targetUser.role === 'owner') {
            return NextResponse.json({ error: 'Cannot modify an Owner via API' }, { status: 403 });
        }

        // Block assigning 'owner' role via API — owner can only be set manually in DB
        if (role === 'owner') {
            return NextResponse.json({ error: 'Owner role cannot be assigned via API' }, { status: 403 });
        }

        // If email is changed, ensure it's unique
        if (email && email !== targetUser.email) {
            const existingEmailUser = await User.findOne({ email });
            if (existingEmailUser) {
                return NextResponse.json({ error: 'Email is already in use by another user' }, { status: 400 });
            }
            targetUser.email = email;
        }

        const oldRole = targetUser.role;

        if (role) targetUser.role = role;
        if (assignedCategories) targetUser.assignedCategories = assignedCategories;
        if (webinarAccess !== undefined) targetUser.webinarAccess = webinarAccess;
        if (name !== undefined) targetUser.name = name;
        if (phone !== undefined) targetUser.phone = phone;
        if (jobTitle !== undefined) targetUser.jobTitle = jobTitle;
        if (age !== undefined) targetUser.age = age;
        if (country !== undefined) targetUser.country = country;
        if (district !== undefined) targetUser.district = district;
        if (organization !== undefined) targetUser.organization = organization;
        if (socials !== undefined) {
            targetUser.socials = {
                ...targetUser.socials,
                ...socials
            };
        }

        const wasBanned = targetUser.isBanned;
        if (isBanned !== undefined) targetUser.isBanned = isBanned;

        await targetUser.save();

        // Determine audit details
        let auditAction = 'user_update';
        let auditDetails = `Owner ${session.email} updated user ${targetUser.email} details`;
        if (isBanned !== undefined && isBanned !== wasBanned) {
            auditAction = isBanned ? 'user_ban' : 'user_unban';
            auditDetails = `Owner ${session.email} ${isBanned ? 'banned' : 'unbanned'} user ${targetUser.email}`;
        } else if (role && role !== oldRole) {
            auditAction = 'role_change';
            auditDetails = `Owner ${session.email} changed ${targetUser.email} role from ${oldRole} to ${role}`;
        }

        // Log the change
        await createAuditLog(session.userId as string, {
            action: auditAction,
            details: auditDetails,
            targetId: targetUser._id.toString(),
            metadata: { oldRole, newRole: role, assignedCategories, isBanned }
        });

        return NextResponse.json({ message: 'User updated successfully', user: targetUser });
    } catch (error) {
        console.error('Admin users update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
