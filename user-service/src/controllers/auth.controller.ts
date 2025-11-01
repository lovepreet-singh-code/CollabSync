import { Request, Response } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any; // or specify a more precise type for user
        }
    }
}
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserById } from '../services/user.service';
import { success, error } from '../utils/response';
import { JWT_SECRET } from '../config';
import { AppError } from '../utils/response';

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const register = async (req: Request, res: Response) => {
    const { error: validationError } = registerSchema.validate(req.body);
    if (validationError) return error(res, validationError.details[0].message, 400);

    const user = await createUser(req.body);
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return success(res, { user: { ...user.toObject(), password: undefined }, token }, 'User registered successfully');
};

export const login = async (req: Request, res: Response) => {
    const { error: validationError } = loginSchema.validate(req.body);
    if (validationError) return error(res, validationError.details[0].message, 400);

    const user = await findUserByEmail(req.body.email);
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return error(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return success(res, { user: { ...user.toObject(), password: undefined }, token }, 'Login successful');
};

export const getProfile = async (req: Request, res: Response) => {
    const { userId } = req.user; // Get userId from the auth middleware
    
    // Import the findUserById function at the top of the file if not already imported
    const user = await findUserById(userId);

    
    if (!user) {
        return error(res, 'User not found', 404);
    }
    
    // Check if toObject exists before calling it
    const userData = user.toObject ? user.toObject() : user;
    return success(res, { ...userData, password: undefined }, 'User profile retrieved successfully');
};