import dotenv from 'dotenv';
import mongoose from 'mongoose';
import redis from 'redis';
import { promisify } from 'util';

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
export interface RedisAsyncClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { EX?: number }): Promise<'OK' | null>;
    del(key: string): Promise<number>;
}

export const createRedisClient = (): RedisAsyncClient => {
    const client = REDIS_URL ? (redis as any).createClient(REDIS_URL) : (redis as any).createClient();
    client.on('error', (err: any) => console.error('Redis Client Error', err));

    const getAsync = promisify(client.get).bind(client) as (key: string) => Promise<string | null>;
    const delAsync = promisify(client.del).bind(client) as (key: string) => Promise<number>;
    const setAsyncBase = promisify(client.set).bind(client) as (...args: any[]) => Promise<'OK' | null>;

    const setAsync = (key: string, value: string, options?: { EX?: number }): Promise<'OK' | null> => {
        if (options?.EX) {
            return setAsyncBase(key, value, 'EX', options.EX);
        }
        return setAsyncBase(key, value);
    };

    return {
        get: getAsync,
        set: setAsync,
        del: delAsync,
    };
};