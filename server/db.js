import { MongoClient, ObjectId } from 'mongodb';

let connectionPromise;
let previousUri;
export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error('MongoDB connection is not configured. Set MONGODB_URI.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }
  if (!connectionPromise || previousUri !== uri) {
    previousUri = uri;
    const client = new MongoClient(uri, {
      maxPoolSize: 8,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 7000,
      connectTimeoutMS: 7000
    });
    connectionPromise = client.connect().then(() => client.db(process.env.MONGODB_DB || 'campusflow'))
      .catch((error) => { connectionPromise = undefined; throw error; });
  }
  return connectionPromise;
}

export function validId(id) { return typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id.toLowerCase(); }
export function toId(id) { return new ObjectId(id); }
