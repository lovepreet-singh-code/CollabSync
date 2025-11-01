import { Request, Response, NextFunction } from 'express';
import { success, error, AppError } from '../utils/response';
import {
  createDocument,
  findDocumentById,
  listDocuments,
  updateDocument,
  deleteDocument,
} from '../services/document.service';

export const create = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const doc = await createDocument(req.body);
    return success(res, doc, 'Document created successfully', 201);
  } catch (err: any) {
    return error(res, err.message || 'Failed to create document', 500);
  }
};

export const getById = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const doc = await findDocumentById(req.params.id);
    if (!doc) return error(res, 'Document not found', 404);
    return success(res, doc, 'Document retrieved successfully');
  } catch (err: any) {
    return error(res, err.message || 'Failed to get document', 500);
  }
};

export const list = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const docs = await listDocuments();
    return success(res, docs, 'Documents retrieved successfully');
  } catch (err: any) {
    return error(res, err.message || 'Failed to list documents', 500);
  }
};

export const update = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const doc = await updateDocument(req.params.id, req.body);
    if (!doc) return error(res, 'Document not found', 404);
    return success(res, doc, 'Document updated successfully');
  } catch (err: any) {
    return error(res, err.message || 'Failed to update document', 500);
  }
};

export const remove = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const doc = await deleteDocument(req.params.id);
    if (!doc) return error(res, 'Document not found', 404);
    return success(res, { id: doc.id }, 'Document deleted successfully');
  } catch (err: any) {
    return error(res, err.message || 'Failed to delete document', 500);
  }
};