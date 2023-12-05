import mongoose from "mongoose";

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  if (cached.conn && cached.conn?._readyState === 1) {
    return cached.conn;
  }

  const disconnected = cached.conn && cached.conn?._readyState !== 1;
  if (!cached.promise || disconnected) {
    const opts: mongoose.ConnectOptions = {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000,
    };

    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(MONGO_URI as string, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}