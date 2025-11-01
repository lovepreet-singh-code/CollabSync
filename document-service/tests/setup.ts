import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest, beforeAll, beforeEach, afterAll } from '@jest/globals';

let mongo: MongoMemoryServer;

// Ensure required envs for auth
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.NODE_ENV = 'test';

// Mock external infra from src/config
jest.mock('../src/config', () => {
  return {
    JWT_SECRET: process.env.JWT_SECRET,
    // Return stubbed Kafka producer that does nothing
    createKafkaProducer: async () => ({
      connect: async () => {},
      disconnect: async () => {},
      send: async () => {},
    }),
    // Return stubbed Redis client compatible with promisify usage
    createRedisClient: () => {
      const client: any = {
        get: (_key: string, cb: (err: any, reply: any) => void) => cb(null, null),
        set: (
          _key: string,
          _value: string,
          _mode: string,
          _ttl: number,
          cb: (err: any, reply: any) => void,
        ) => cb(null, 'OK'),
        del: (..._keys: string[]) => {},
        keys: (_pattern: string, cb: (err: any, keys: string[]) => void) => cb(null, []),
        on: (_event: string, _handler: (...args: any[]) => void) => {},
        quit: () => {},
      };
      return client;
    },
  };
});

// Global setup/teardown hooks
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, {
    dbName: 'testdb',
  } as any);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});