import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Types } from 'mongoose';
import { success, error } from '../utils/response';
import { DocumentService } from '../services/document.service';

let servicePromise: Promise<DocumentService> | null = null;
const getService = async () => {
  if (!servicePromise) servicePromise = DocumentService.init();
  return servicePromise;
};

const objectId = () => Joi.string().regex(/^[a-fA-F0-9]{24}$/).message('Invalid ObjectId');

const sharedWithSchema = Joi.array().items(
  Joi.object({
    userId: objectId().required(),
    permission: Joi.string().valid('read', 'write').required(),
  })
);

export const createDocument = async (req: Request, res: Response, _next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(),
    sharedWith: sharedWithSchema.optional(),
  });

  const { error: validationError } = schema.validate(req.body);
  if (validationError) return error(res, validationError.details[0].message, 400);
  if (!req.user?.userId) return error(res, 'Unauthorized', 403);

  try {
    const service = await getService();
    const payload = {
      title: req.body.title,
      content: req.body.content,
      ownerId: new Types.ObjectId(req.user.userId),
      sharedWith: (req.body.sharedWith || []).map((e: any) => ({
        userId: new Types.ObjectId(e.userId),
        permission: e.permission,
      })),
    };
    const doc = await service.createDocument(payload);
    return success(res, doc, 'Document created successfully', 201);
  } catch (err: any) {
    return error(res, err.message || 'Failed to create document', 500);
  }
};

export const getDocuments = async (req: Request, res: Response, _next: NextFunction) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  });
  const { error: validationError } = schema.validate(req.query);
  if (validationError) return error(res, validationError.details[0].message, 400);
  if (!req.user?.userId) return error(res, 'Unauthorized', 403);

  try {
    const service = await getService();
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const docs = await service.getDocumentsByOwner(String(req.user.userId), { page, limit });
    return success(res, docs, 'Documents retrieved successfully');
  } catch (err: any) {
    return error(res, err.message || 'Failed to list documents', 500);
  }
};

export const getDocumentById = async (req: Request, res: Response, _next: NextFunction) => {
  const schema = Joi.object({ id: objectId().required() });
  const { error: validationError } = schema.validate(req.params);
  if (validationError) return error(res, validationError.details[0].message, 400);

  try {
    const service = await getService();
    const doc = await service.getDocumentById(req.params.id);
    if (!doc || doc.isDeleted) return error(res, 'Document not found', 404);
    return success(res, doc, 'Document retrieved successfully');
  } catch (err: any) {
    return error(res, err.message || 'Failed to get document', 500);
  }
};

export const updateDocument = async (req: Request, res: Response, _next: NextFunction) => {
  const paramsSchema = Joi.object({ id: objectId().required() });
  const bodySchema = Joi.object({
    title: Joi.string().min(1).optional(),
    content: Joi.string().allow('').optional(),
    sharedWith: sharedWithSchema.optional(),
    version: Joi.number().integer().min(1).optional(),
  }).min(1);

  const paramsValidation = paramsSchema.validate(req.params);
  if (paramsValidation.error) return error(res, paramsValidation.error.details[0].message, 400);

  const bodyValidation = bodySchema.validate(req.body);
  if (bodyValidation.error) return error(res, bodyValidation.error.details[0].message, 400);
  if (!req.user?.userId) return error(res, 'Unauthorized', 403);

  try {
    const service = await getService();
    const updates: any = { ...req.body };
    if (updates.sharedWith) {
      updates.sharedWith = updates.sharedWith.map((e: any) => ({
        userId: new Types.ObjectId(e.userId),
        permission: e.permission,
      }));
    }
    const doc = await service.updateDocument(req.params.id, updates, String(req.user.userId));
    if (!doc) return error(res, 'Document not found', 404);
    return success(res, doc, 'Document updated successfully');
  } catch (err: any) {
    if (err?.message?.toLowerCase().includes('not authorized')) {
      return error(res, 'Not authorized to update this document', 403);
    }
    return error(res, err.message || 'Failed to update document', 500);
  }
};

export const deleteDocument = async (req: Request, res: Response, _next: NextFunction) => {
  const schema = Joi.object({ id: objectId().required() });
  const { error: validationError } = schema.validate(req.params);
  if (validationError) return error(res, validationError.details[0].message, 400);
  if (!req.user?.userId) return error(res, 'Unauthorized', 403);

  try {
    const service = await getService();
    const doc = await service.deleteDocument(req.params.id, String(req.user.userId));
    if (!doc) return error(res, 'Document not found', 404);
    return success(res, { id: doc.id }, 'Document deleted successfully');
  } catch (err: any) {
    if (err?.message?.toLowerCase().includes('not authorized')) {
      return error(res, 'Not authorized to delete this document', 403);
    }
    return error(res, err.message || 'Failed to delete document', 500);
  }
};

// Backwards-compatible exports for existing routes
export const create = createDocument;
export const list = getDocuments;
export const getById = getDocumentById;
export const update = updateDocument;
export const remove = deleteDocument;