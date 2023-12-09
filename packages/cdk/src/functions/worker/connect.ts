import mongoose from "mongoose";

let conn: Promise<typeof mongoose> | null = null;
const uri =
  (process.env.MONGO_URI as string) ?? "mongodb://localhost:27017/convey";

export async function connect() {
  if (conn == null) {
    conn = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => mongoose);

    await conn;
  }

  process.on("SIGINT", () => mongoose.connection.close());
  process.on("SIGTERM", () => mongoose.connection.close());

  return conn;
}
