import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const uri = env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment');
    }
    await mongoose.connect(uri, {
      // Mongoose 6+ handles most options automatically
    });
    console.info('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
