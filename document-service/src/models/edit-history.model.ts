import { Schema, model, Document, Types } from 'mongoose';

export interface IEditHistory extends Document {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  changes: Record<string, any>;
  previousVersion: number;
  version: number;
  createdAt: Date;
}

const EditHistorySchema = new Schema<IEditHistory>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changes: { type: Schema.Types.Mixed, required: true },
    previousVersion: { type: Number, required: true },
    version: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

EditHistorySchema.index({ documentId: 1, version: 1 });

export const EditHistoryModel = model<IEditHistory>('EditHistory', EditHistorySchema);