import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    targetId?: mongoose.Types.ObjectId; // E.g., Note ID, Category ID
    details: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
        },
        details: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
