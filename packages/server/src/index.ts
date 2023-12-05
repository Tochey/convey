import "dotenv/config";
import app from "./app";
import { Server as httpserver } from "http";
import { connectDb } from "./init/db";

async function bootServer(PORT: number): Promise<httpserver> {
  process.on("SIGTERM", async () => {
    console.info("[express] SIGTERM received");

    console.info("[express] cleaning up");
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.info("[express] exiting");
    process.exit(0);
  });

  try {
    await connectDb();
  } catch (err) {
    console.error("Failed to boot server");
    console.error(err);
    return process.exit(1);
  }

  return app.listen(PORT, () => {
    console.log(`Server listening in ${process.env.NODE_ENV} mode`);
  });
}

const PORT = parseInt(process.env.PORT || "8080", 10);
bootServer(PORT);
