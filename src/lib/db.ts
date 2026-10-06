import "server-only";
import mongoose from "mongoose";

/**
 * One shared connection per server process. In dev, Next.js hot-reloads modules,
 * so the promise is cached on globalThis to avoid opening a new pool every edit.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = g.__mongoose ?? (g.__mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 10 });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}
