import { Response } from "express";
import hi from "./hi";
import deployment from "./deployment";

const API_ROUTES = {
  "/hi": hi,
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
