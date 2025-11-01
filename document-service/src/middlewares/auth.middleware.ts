import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email?: string };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(403).json({ status: 'error', message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string };
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (_err) {
    return res.status(403).json({ status: 'error', message: 'Invalid token' });
  }
};