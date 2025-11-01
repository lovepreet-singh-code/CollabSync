import { Request, Response, NextFunction } from 'express';
import { DocumentModel } from '../models/document.model';
import { Types } from 'mongoose';

type Permission = 'read' | 'write';

export const requireDocumentAccess = (required: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user || !user.userId) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ status: 'error', message: 'Document id is required' });
      }

      const doc = await DocumentModel.findById(id);
      if (!doc || doc.isDeleted) {
        return res.status(404).json({ status: 'error', message: 'Document not found' });
      }

      // Owner has full access
      if (String(doc.ownerId) === String(user.userId)) {
        return next();
      }

      // Check sharedWith permissions
      const entry = (doc.sharedWith || []).find((e) => String(e.userId) === String(user.userId));
      if (!entry) {
        return res.status(403).json({ status: 'error', message: 'Access denied' });
      }

      if (required === 'write' && entry.permission !== 'write') {
        return res.status(403).json({ status: 'error', message: 'Write permission required' });
      }

      // For 'read', both 'read' and 'write' are allowed
      return next();
    } catch (_err) {
      return res.status(403).json({ status: 'error', message: 'Access validation failed' });
    }
  };
};