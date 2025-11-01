import { Schema, model, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content?: string;
  ownerId: string;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export const DocumentModel = model<IDocument>('Document', DocumentSchema);