import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    rank: number;
    categoryId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SubCategorySchema: Schema<ISubCategory> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a sub-category name'],
            maxlength: [100, 'Name cannot be more than 100 characters'],
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
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please provide a category'],
        },
    },
    { timestamps: true }
);

// Compound index to ensure rank is unique per category
SubCategorySchema.index({ categoryId: 1, rank: 1 }, { unique: true });

// Compound index to ensure slugs are unique per category (or globally unique if desired, keeping global for simplicity here)
// Generally slugs should be globally unique for simpler routing: /category/subcategory
// But if we want /category-a/notes vs /category-b/notes it might be different.
// The user requirement: / [catgory]/[sub-category]/
// So slugs should be unique? Or unique combination?
// Let's assume global unique slug for subcategory for simplicity, or we can deal with conflicts later.
// For now, simple unique slug.

const SubCategory: Model<ISubCategory> =
    mongoose.models.SubCategory ||
    mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);

export default SubCategory;
