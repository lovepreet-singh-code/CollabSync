import express from 'express';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';
import { connectDB, createRedisClient } from './config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Create Redis client
        createRedisClient();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Handle graceful shutdown on SIGINT
process.on('SIGINT', async () => {
    console.log('Gracefully shutting down...');
    // Here you can close your database connections and Redis client if needed
    process.exit(0);
});

// Start the server
startServer();