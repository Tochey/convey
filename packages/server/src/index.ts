import "dotenv/config";
import app from "./app";
import { Server as httpserver } from "http";

async function bootServer(PORT: number): Promise<httpserver> {
  return app.listen(PORT, () => {
    console.log(`Server listening in ${process.env.NODE_ENV} mode`);
  });
}

const PORT = parseInt(process.env.PORT || "8080", 10);
bootServer(PORT);

process.on('SIGTERM', async () => {
  console.info('[express] SIGTERM received');

  console.info('[express] cleaning up');
  await new Promise(resolve => setTimeout(resolve, 100));

  console.info('[express] exiting');
  process.exit(0)
});
