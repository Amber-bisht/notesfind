import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    rank: number;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            maxlength: [100, 'Name cannot be more than 100 characters'],
            unique: true,
        },
        slug: {
            type: String,
            required: [true, 'Please provide a slug'],
            unique: true,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        image: {
            type: String,
        },
        rank: {
            type: Number,
            required: [true, 'Please provide a rank'],
            unique: true,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
