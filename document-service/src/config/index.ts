import dotenv from 'dotenv';
import Joi from 'joi';
import mongoose from 'mongoose';
import * as redis from 'redis';
import { Kafka, Producer } from 'kafkajs';

// Load environment variables
dotenv.config();

// Validate environment variables
const envSchema = Joi.object({
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  MONGO_URI: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(8).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  KAFKA_BROKERS: Joi.string().required(), // comma-separated list
  KAFKA_CLIENT_ID: Joi.string().default('document-service'),
  KAFKA_GROUP_ID: Joi.string().default('document-service-group'),
}).unknown(true);

const { value: env, error: envError } = envSchema.validate(process.env);
if (envError) {
  throw new Error(`Invalid environment configuration: ${envError.message}`);
}

// Server configuration
export const PORT = Number(env.PORT);
export const NODE_ENV = env.NODE_ENV as string;

// MongoDB configuration
export const MONGO_URI = env.MONGO_URI as string;

// Redis configuration
export const REDIS_URL = env.REDIS_URL as string;

// JWT configuration
export const JWT_SECRET = env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN as string;

// Kafka configuration
export const KAFKA_BROKERS = (env.KAFKA_BROKERS as string).split(',').map((b) => b.trim());
export const KAFKA_CLIENT_ID = env.KAFKA_CLIENT_ID as string;
export const KAFKA_GROUP_ID = env.KAFKA_GROUP_ID as string;

// Helper: Connect to MongoDB
export const connectDB = async () => {
  return mongoose.connect(
    MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    } as any
  );
};

// Helper: Create Redis client (node-redis v3 style)
export const createRedisClient = () => {
  const client: any = (redis as any).createClient(REDIS_URL);
  client.on('error', (err: any) => {
    console.error('Redis Client Error:', err);
  });
  return client;
};

// Helper: Create and connect Kafka producer
export const createKafkaProducer = async (): Promise<Producer> => {
  const kafka = new Kafka({ clientId: KAFKA_CLIENT_ID, brokers: KAFKA_BROKERS });
  const producer = kafka.producer();
  await producer.connect();
  return producer;
};