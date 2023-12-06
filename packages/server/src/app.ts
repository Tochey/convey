import express, { json, urlencoded } from "express";
import { createServer } from "http";
import cors from "cors";
import "dotenv/config";
import { addApiRoutes } from "./endpoint/routes";
import passport from "passport";
import { github } from "./strategies/github";

function createApp() {
  const app = express();
  const corsConfig = process.env.CORS_ORIGIN ?? "http://localhost:5173";
  const httpServer = createServer(app);

  app.use(
    cors({
      origin: corsConfig,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(passport.initialize());
  passport.use(github());
  addApiRoutes(app);
  // app.use(errorHandlingMiddleware)
  return httpServer;
}

export default createApp();
