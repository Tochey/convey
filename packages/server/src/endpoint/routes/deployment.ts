import { Router } from "express";
import * as DeploymentController from "../controllers/deployment";
import { authenticateRequest } from "../../middleware/auth";
import { asyncHandler, validateRequest } from "../../middleware/api-util";
import { VALIDATION_ERR_MESSAGE } from "../../constants";

const router = Router();

import z from "zod";

const create = z.object({
  name : z.string().min(3).max(80),
  url: z.string().url(),
  buildCommand: z.string().min(4),
  startCommand: z.string().min(4),
  port: z.number(),
});

router.post(
  "/create",
  validateRequest({
    body: create,
    validationErrorMessage: VALIDATION_ERR_MESSAGE,
  }),
  authenticateRequest(),
  asyncHandler(DeploymentController.create),
);

router.get(
  "/list",
  authenticateRequest(),
  asyncHandler(DeploymentController.list),
)

router.get(
  "/logs/:id",
  authenticateRequest(),
  asyncHandler(DeploymentController.getLogs),
)

export default router;
