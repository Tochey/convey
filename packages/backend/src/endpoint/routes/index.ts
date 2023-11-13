import { Response } from "express";
import hi from "./hi";


const API_ROUTES= {
  "/hi": hi,
};

function addApiRoutes(app ) {
  Object.keys(API_ROUTES).forEach((route) => {
    app.use(route, API_ROUTES[route]);
  });

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ message: "ok" });
  });
}

export { addApiRoutes };
