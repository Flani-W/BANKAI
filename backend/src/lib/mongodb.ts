import { MongoClient, type Collection, type Db, type ObjectId } from 'mongodb';
import { config } from './config.js';

/**
 * A user record. Replaces Supabase's managed `auth.users`: we now own the storage,
 * the password hash, and the lifecycle.
 */
export interface UserDoc {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const client = new MongoClient(config.mongoUri);
let db: Db | null = null;

/**
 * Connect once at startup and ensure indexes. The unique index on `email` is what gives
 * us the "already registered" conflict that Supabase used to enforce for us.
 */
export async function connectMongo(): Promise<Db> {
  if (db) return db;
  await client.connect();
  db = client.db(config.mongoDb);
  await db.collection<UserDoc>('users').createIndex({ email: 1 }, { unique: true });
  return db;
}

export function users(): Collection<UserDoc> {
  if (!db) throw new Error('MongoDB not connected — call connectMongo() at startup');
  return db.collection<UserDoc>('users');
}

/** Close the connection (used on graceful shutdown). */
export async function closeMongo(): Promise<void> {
  await client.close();
  db = null;
}
