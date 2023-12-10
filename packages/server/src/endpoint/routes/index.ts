import { Response } from "express";
import auth from "./auth";
import deployment from "./deployment";
import oauth from "./oauth";

const API_ROUTES = {
  "/auth": auth,
  "/oauth": oauth,
  "/deployment": deployment,
};

function addApiRoutes(app) {
  Object.keys(API_ROUTES).forEach((route) => {
    app.use(route, API_ROUTES[route]);
  });

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ message: "ok" });
  });
}

export { addApiRoutes };
