import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  try {
    if (mongoUri && mongoUri.trim() !== '') {
      console.log(`Connecting to specified MongoDB URI...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
      return conn;
    }
  } catch (err) {
    console.warn(`Could not connect to external MongoDB: ${err.message}. Falling back to In-Memory MongoDB.`);
  }

  try {
    console.log('Starting Embedded In-Memory MongoDB for zero-configuration instant local execution...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected at: ${uri}`);
    return conn;
  } catch (memoryErr) {
    console.error('Fatal Error starting In-Memory MongoDB:', memoryErr.message);
    throw memoryErr;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
