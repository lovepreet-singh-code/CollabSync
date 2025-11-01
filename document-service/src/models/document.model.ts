import { Schema, model, Document, Types } from 'mongoose';

export interface ISharedWithEntry {
  userId: Types.ObjectId;
  permission: 'read' | 'write';
}

export interface IDocument extends Document {
  title: string;
  content?: string;
  ownerId: Types.ObjectId;
  sharedWith: ISharedWithEntry[];
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        permission: { type: String, enum: ['read', 'write'], required: true },
        _id: false,
      },
    ],
    isDeleted: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Indexes
DocumentSchema.index({ ownerId: 1 });
DocumentSchema.index({ title: 'text', content: 'text' });

export const DocumentModel = model<IDocument>('Document', DocumentSchema);