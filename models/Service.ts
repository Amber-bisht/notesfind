import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IService extends Document {
    title: string;
    description: string;
    price: number;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
