import dotenv from 'dotenv';
import { createClient } from 'redis';

// Load environment variables
dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB configuration
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabsync-documentdb';

// Redis configuration
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Kafka configuration
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'document-service';
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'document-service-group';

// Create Redis client
export const createRedisClient = () => {
  const client = createClient({
    url: REDIS_URL,
  });
  
  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
  return client;
};