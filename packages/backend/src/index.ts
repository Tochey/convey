import "dotenv/config";
import app from "./app";
import { Server as httpserver } from "http";

async function bootServer(PORT: number): Promise<httpserver> {
  return app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

const PORT = parseInt(process.env.PORT || "8080", 10);
bootServer(PORT);
