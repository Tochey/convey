import { Router } from "express";
import * as DeploymentController from "../controllers/deployment";
import { authenticateRequest } from "../../middleware/auth";
import { asyncHandler, validateRequest } from "../../middleware/api-util";
import { VALIDATION_ERR_MESSAGE } from "../../constants";

const router = Router();

import z from "zod";

const create = z.object({
  url: z.string().url(),
  branch: z.string(),
  buildCommand: z.string().min(4),
  startCommand: z.string().min(4),
  rootDirectory: z.string().min(1),
  port: z.string(),
});

router.post(
  "/create",
  validateRequest({
    body: create,
    validationErrorMessage: VALIDATION_ERR_MESSAGE,

  }),
  authenticateRequest(),
  asyncHandler(DeploymentController.create)
  
);

export default router;
