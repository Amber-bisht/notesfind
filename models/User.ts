import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
    ADMIN = 'admin',
    PUBLISHER = 'publisher',
    USER = 'user',
}

export interface IUser extends Document {
    email: string;
    name: string;
    image?: string;
    role: UserRole;
    downloads: {
        noteId: mongoose.Types.ObjectId;
        slug: string;
        downloadedAt: Date;
    }[];
    socials: {
        github?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        codeforces?: string;
        leetcode?: string;
        website?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            maxlength: [60, 'Email cannot be more than 60 characters'],
        },
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            maxlength: [60, 'Name cannot be more than 60 characters'],
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
        downloads: [{
            noteId: { type: Schema.Types.ObjectId, ref: 'Note' },
            slug: String,
            downloadedAt: { type: Date, default: Date.now }
        }],
        socials: {
            github: String,
            twitter: String,
            linkedin: String,
            instagram: String,
            codeforces: String,
            leetcode: String,
            website: String
        },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
