import { Router } from "express";
import * as DeploymentController from "../controllers/deployment";
import { authenticateRequest } from "../../middleware/auth";
import { asyncHandler, validateRequest } from "../../middleware/api-util";
import { VALIDATION_ERR_MESSAGE } from "../../constants";

const router = Router();

import z from "zod";

const create = z.object({
  name: z.string().min(3).max(80),
  url: z.string().url(),
  buildCommand: z.string().min(4),
  startCommand: z.string().min(4),
  port: z.number(),
  rootDirectory: z.string().optional(),
  env: z.record(z.string()).optional(),
  branch: z.string().optional(),
  type: z.enum(["LAMBDA", "CONTAINER"]).optional(),
});

const update = z.object({
  name: z.string().min(3).max(80).optional(),
  buildCommand: z.string().min(4).optional(),
  startCommand: z.string().min(4).optional(),
  port: z.number().optional().optional(),
  rootDirectory: z.string().optional(),
  env: z.record(z.string()).optional(),
  branch: z.string().optional(),
  status: z
    .enum(["queued", "building", "deploying", "deployed", "failed"])
    .optional(),
  logs: z.array(z.string()).optional(),
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
);

router.get(
  "/get/:id",
  authenticateRequest(),
  asyncHandler(DeploymentController.get),
);

router.patch(
  "/update/:id",
  validateRequest({
    body: update,
    validationErrorMessage: VALIDATION_ERR_MESSAGE,
  }),
  authenticateRequest(),
  asyncHandler(DeploymentController.update),
);

router.delete(
  "/delete/:id",
  authenticateRequest(),
  asyncHandler(DeploymentController.remove),
);

export default router;
