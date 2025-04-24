
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || `mongodb+srv://dbUser:${process.env.MONGODB_PASSWORD}@cluster0.o6epbot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

export const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('edu_notes');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function closeMongoDB() {
  await client.close();
  console.log('MongoDB connection closed');
}
