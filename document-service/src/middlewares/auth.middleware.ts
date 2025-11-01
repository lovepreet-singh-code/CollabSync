import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role?: string };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ status: 'error', message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err: any) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};