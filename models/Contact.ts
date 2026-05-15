import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    message: string;
    referenceLink?: string;
    tag: 'Copyright' | 'Bug' | 'General' | 'Feedback';
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: [2000, 'Message cannot be more than 2000 characters'],
        },
        referenceLink: {
            type: String,
        },
        tag: {
            type: String,
            enum: ['Copyright', 'Bug', 'General', 'Feedback'],
            default: 'General',
        },
    },
    { timestamps: true }
);

const Contact: Model<IContact> =
    mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
