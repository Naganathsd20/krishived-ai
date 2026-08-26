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

// Ensure DNS configuration for Windows SRV resolution prior to connection initialization
if (typeof window === "undefined") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    // Ignore DNS override errors
  }
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

  // 1. Return active connection immediately if ready state is connected
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  // 2. Clear stale cached promises if the connection is disconnected (0) or invalid
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.promise = null;
    cached.conn = null;
  }

  // 3. Ensure DNS resolvers are configured for Node.js SRV lookups on Windows
  if (typeof window === "undefined") {
    try {
      dns.setDefaultResultOrder("ipv4first");
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    } catch {
      // Ignore DNS override errors
    }
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = (async () => {
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect().catch(() => {});
        }
        return await mongoose.connect(MONGODB_URI, opts);
      } catch (err) {
        cached.promise = null;
        cached.conn = null;
        throw err;
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

/**
 * Lightweight server database health ping check helper.
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  latencyMs: number | null;
}> {
  try {
    const startTime = Date.now();
    const db = await connectDB();
    if (!db.connection || !db.connection.db) {
      return { isHealthy: false, latencyMs: null };
    }
    await db.connection.db.admin().ping();
    const latencyMs = Date.now() - startTime;
    return { isHealthy: true, latencyMs };
  } catch {
    return { isHealthy: false, latencyMs: null };
  }
}

export default connectDB;
