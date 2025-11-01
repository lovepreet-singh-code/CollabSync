import { Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const success = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const error = (res: Response, message: string, statusCode = 500) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};