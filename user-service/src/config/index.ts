import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient, RedisClientType } from 'redis';

// Load environment variables from .env file
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 3000;
export const MONGO_URI: string = process.env.MONGO_URI || '';
export const REDIS_URL: string = process.env.REDIS_URL || '';
export const JWT_SECRET: string = process.env.JWT_SECRET || 'your_jwt_secret';

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Create and return a Redis client
export const createRedisClient = (): RedisClientType => {
    const client = createClient({ 
        url: REDIS_URL,
        socket: {
            protocol: 2
        }
    });
    client.on('error', (err) => console.error('Redis Client Error', err));
    client.connect().catch(console.error);
    return client;
};