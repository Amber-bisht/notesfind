import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import mongoose from 'mongoose';

export function hasCategoryAccess(user: { role: string; assignedCategories?: mongoose.Types.ObjectId[] | string[] }, categoryId: string | mongoose.Types.ObjectId) {
    if (user.role === 'owner') return true;
    if (!user.assignedCategories) return false;

    const catIdStr = categoryId.toString();
    return user.assignedCategories.some(id => id.toString() === catIdStr);
}
//hok
