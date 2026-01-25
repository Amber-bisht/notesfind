import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
    title: string;
    slug: string;
    content: string;
    subCategoryId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    images: string[];
    isPublished: boolean;
    rank?: number;
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema: Schema<INote> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Please provide a slug'],
            unique: true,
        },
        content: {
            type: String,
            required: [true, 'Please provide content'],
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: [true, 'Please provide a sub-category'],
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide an author'],
        },
        images: {
            type: [String],
            default: [],
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        rank: {
            type: Number,
            // required: [true, 'Please provide a rank'], // Making simple for now, maybe default? Or required? User request implies sorting.
            // Let's make it not strictly required in schema for backward compatibility if any, but good to enforce.
            // User said "rank - 1,2,3,4 etc -no duplicate rank"
            // Let's make it required to ensure order.
        },
    },
    { timestamps: true }
);

// Compound index to ensure rank is unique per subCategory
NoteSchema.index({ subCategoryId: 1, rank: 1 }, { unique: true, sparse: true });

const Note: Model<INote> =
    mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
