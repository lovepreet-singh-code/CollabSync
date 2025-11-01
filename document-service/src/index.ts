import app from './app';
import mongoose from 'mongoose';
import { PORT, connectDB, createRedisClient, createKafkaProducer } from './config';

async function start() {
  try {
    // Connect MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Connect Redis (node-redis v3 style)
    const redisClient: any = createRedisClient();
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        redisClient.removeListener('error', onError);
        resolve();
      };
      const onError = (err: any) => {
        redisClient.removeListener('ready', onReady);
        reject(err);
      };
      redisClient.once('ready', onReady);
      redisClient.once('error', onError);
    });
    console.log('Connected to Redis');

    // Connect Kafka producer
    const kafkaProducer = await createKafkaProducer();
    console.log('Kafka producer connected');

    const server = app.listen(PORT, () => {
      console.log(`Document service running on http://localhost:${PORT}`);
    });

    const gracefulShutdown = async (signal?: string, exitCode = 0) => {
      try {
        console.log(signal ? `Received ${signal}, shutting down...` : 'Shutting down...');
        await new Promise<void>((resolve) => server.close(() => resolve()));
        await mongoose.connection.close();
        try {
          await new Promise<void>((resolve) => redisClient.quit(() => resolve()));
        } catch (e) {
          // ignore
        }
        try {
          await kafkaProducer.disconnect();
        } catch (e) {
          // ignore
        }
      } finally {
        process.exit(exitCode);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));

    process.on('unhandledRejection', (reason: any) => {
      console.error('Unhandled Rejection:', reason);
      gracefulShutdown(undefined, 1);
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      gracefulShutdown(undefined, 1);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();