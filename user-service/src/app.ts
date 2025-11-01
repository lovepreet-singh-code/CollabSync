import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
// @ts-ignore
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import { AppError, error } from './utils/response';

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError('Not Found', 404));
});

// Global error handler
app.use((err: AppError, req: Request, res: Response) => {
    const statusCode = err.statusCode || 500;
    error(res, err.message, statusCode);
});

export default app;