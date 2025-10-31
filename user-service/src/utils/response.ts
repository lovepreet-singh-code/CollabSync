import { Response } from 'express';

export const success = (res: Response, data: any, message?: string, status: number = 200) => {
    return res.status(status).json({
        status: 'success',
        message: message || 'Request was successful',
        data,
    });
};

export const error = (res: Response, message: string, status: number = 500) => {
    return res.status(status).json({
        status: 'error',
        message,
    });
};

export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}