import passport from "passport";
import { Router } from "express";
import { Request } from "../../types";
import { asyncHandler } from "../../middleware/api-util";
import * as OauthController from "../controllers/oauth";
const domains = {
  client: process.env.DOMAIN_CLIENT,
  server: process.env.DOMAIN_SERVER,
};

const router = Router();

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email", "read:user"],
    session: false,
  }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${domains.client}/login`,
    failureMessage: true,
    session: false,
    scope: ["user:email", "read:user"],
  }),
  asyncHandler(OauthController.setHeaders),
);

export default router;
