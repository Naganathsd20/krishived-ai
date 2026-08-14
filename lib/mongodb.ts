import mongoose from "mongoose";
import dns from "dns";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB using Mongoose with a global cached connection
 * to prevent duplicate database connections in Next.js development mode.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Invalid/Missing environment variable: 'MONGODB_URI'. Please define it in your .env.local file."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    cached.promise = (async () => {
      try {
        return await mongoose.connect(MONGODB_URI, opts);
      } catch (firstErr) {
        // Fallback for Windows DNS resolution of MongoDB Atlas SRV (_mongodb._tcp) records
        if (typeof window === "undefined") {
          try {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
          } catch {
            // Ignore DNS override errors
          }
        }
        return await mongoose.connect(MONGODB_URI, opts);
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
