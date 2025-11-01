import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { DocumentModel, IDocument } from '../models/document.model';
import { DocumentService } from '../services/document.service';
import { Types } from 'mongoose';

let servicePromise: Promise<DocumentService> | null = null;
const getService = async () => {
  if (!servicePromise) servicePromise = DocumentService.init();
  return servicePromise;
};

type Permission = 'read' | 'write';
const hasAccess = (doc: IDocument, userId: string, required: Permission) => {
  if (String(doc.ownerId) === String(userId)) return true;
  const entry = (doc.sharedWith || []).find((e) => String(e.userId) === String(userId));
  if (!entry) return false;
  if (required === 'write' && entry.permission !== 'write') return false;
  return true;
};

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    try {
      const token = (socket.handshake as any).auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('No token provided'));
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string };
      (socket.data as any).user = { userId: decoded.userId, email: decoded.email };
      next();
    } catch (_err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket.data as any).user as { userId: string; email?: string };

    socket.on('doc:join', async ({ id }: { id: string }) => {
      try {
        const doc = await DocumentModel.findById(id);
        if (!doc || doc.isDeleted) {
          return socket.emit('doc:join.error', { status: 'error', message: 'Document not found' });
        }
        if (!hasAccess(doc, user.userId, 'read')) {
          return socket.emit('doc:join.error', { status: 'error', message: 'Access denied' });
        }
        socket.join(`doc:${id}`);
        socket.emit('doc:join.success', { status: 'success', id, version: doc.version });
      } catch (e: any) {
        socket.emit('doc:join.error', { status: 'error', message: e?.message || 'Join failed' });
      }
    });

    socket.on('doc:edit', async (payload: { id: string; changes: Partial<IDocument>; version: number }) => {
      const { id, changes, version } = payload || ({} as any);
      try {
        const doc = await DocumentModel.findById(id);
        if (!doc || doc.isDeleted) {
          return socket.emit('doc:edit.error', { status: 'error', message: 'Document not found' });
        }
        if (!hasAccess(doc, user.userId, 'write')) {
          return socket.emit('doc:edit.error', { status: 'error', message: 'Write permission required' });
        }

        const service = await getService();
        const updates: any = { ...changes, version };
        if (updates.sharedWith) {
          updates.sharedWith = (updates.sharedWith as any[]).map((e: any) => ({
            userId: new Types.ObjectId(e.userId),
            permission: e.permission,
          }));
        }
        const updated = await service.updateDocument(id, updates, String(user.userId));
        if (!updated) {
          return socket.emit('doc:edit.error', { status: 'error', message: 'Document not found' });
        }
        io.to(`doc:${id}`).emit('doc:updated', { id, version: updated.version, document: updated });
        socket.emit('doc:edit.success', { status: 'success', id, version: updated.version });
      } catch (err: any) {
        if (typeof err?.message === 'string') {
          const msg = err.message.toLowerCase();
          if (msg.includes('version conflict')) {
            return socket.emit('doc:edit.error', { status: 'error', message: 'Version conflict', code: 409 });
          }
          if (msg.includes('version required')) {
            return socket.emit('doc:edit.error', { status: 'error', message: 'Version required', code: 400 });
          }
          if (msg.includes('not authorized')) {
            return socket.emit('doc:edit.error', { status: 'error', message: 'Not authorized', code: 403 });
          }
        }
        socket.emit('doc:edit.error', { status: 'error', message: err?.message || 'Edit failed' });
      }
    });

    socket.on('disconnect', () => {
      // No-op; rooms cleaned up automatically
    });
  });

  return io;
};