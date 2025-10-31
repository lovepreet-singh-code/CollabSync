import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

interface IUserRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const verifyToken = (req: IUserRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });

        req.user = {
            userId: (decoded as any).userId,
            role: (decoded as any).role,
        };
        next();
    });
};

export const requireRole = (role: string) => {
    return (req: IUserRequest, res: Response, next: NextFunction) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }
    };
};