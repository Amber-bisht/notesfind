import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebinar extends Document {
    image: string;
    title: string;
    description: string;
    longDescription?: string;
    timestamp: Date;
    type: 'online' | 'offline';
    link?: string;
    venue?: string;
    address?: string;
    mapLink?: string;
    createdBy: mongoose.Types.ObjectId; // Reference to the User (Admin/Publisher)
    createdAt: Date;
    updatedAt: Date;
}

const WebinarSchema: Schema<IWebinar> = new Schema(
    {
        image: {
            type: String,
            required: [true, 'Please provide an image URL'],
        },
        title: {
            type: String,
            required: [true, 'Please provide a webinar title'],
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        longDescription: {
            type: String,
        },
        timestamp: {
            type: Date,
            required: [true, 'Please provide a date and time'],
        },
        type: {
            type: String,
            enum: ['online', 'offline'],
            default: 'online',
        },
        link: {
            type: String, // Required if type is 'online'
        },
        venue: {
            type: String, // Required if type is 'offline'
        },
        address: {
            type: String, // Required if type is 'offline'
        },
        mapLink: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

const Webinar: Model<IWebinar> =
    mongoose.models.Webinar || mongoose.model<IWebinar>('Webinar', WebinarSchema);

export default Webinar;
