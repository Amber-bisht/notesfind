import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRequest extends Document {
    name: string;
    email: string;
    message: string;
    status: 'pending' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const RequestSchema: Schema<IRequest> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            maxlength: [100, 'Name cannot be more than 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
            maxlength: [1000, 'Message cannot be more than 1000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const Request: Model<IRequest> =
    mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);

export default Request;
