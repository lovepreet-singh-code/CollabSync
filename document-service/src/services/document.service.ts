import { DocumentModel, IDocument } from '../models/document.model';

export const createDocument = async (payload: Partial<IDocument>): Promise<IDocument> => {
  const doc = new DocumentModel(payload as IDocument);
  await doc.save();
  return doc;
};

export const findDocumentById = async (id: string): Promise<IDocument | null> => {
  return DocumentModel.findById(id);
};

export const listDocuments = async (): Promise<IDocument[]> => {
  return DocumentModel.find().sort({ createdAt: -1 });
};

export const updateDocument = async (
  id: string,
  updates: Partial<IDocument>
): Promise<IDocument | null> => {
  return DocumentModel.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteDocument = async (id: string): Promise<IDocument | null> => {
  return DocumentModel.findByIdAndDelete(id);
};