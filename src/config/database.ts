import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

let connectionPromise: ReturnType<typeof mongoose.connect> | null = null;

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  dns.setServers(['8.8.8.8', '1.1.1.1']);
  mongoose.set('strictQuery', true);

  connectionPromise ??= mongoose.connect(env.MONGODB_URI).catch((error) => {
    connectionPromise = null;
    throw error;
  });

  await connectionPromise;
};
