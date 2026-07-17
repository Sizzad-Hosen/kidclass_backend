import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
};
