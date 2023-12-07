import mongoose from "mongoose";
import { MongoClientOptions } from "mongodb";

export async function connectDb(): Promise<void> {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error("No database url provided");
  }

  const connectionOptions: MongoClientOptions = {
    connectTimeoutMS: 2000,
    serverSelectionTimeoutMS: 2000,
  };

  try {
    await mongoose.connect(MONGO_URI as string, connectionOptions);
  } catch (error) {
    console.error(
      "Failed to connect to database, Exiting with exit status code 1"
    );
    console.error(error.message);
    return process.exit(1);
  }
}
