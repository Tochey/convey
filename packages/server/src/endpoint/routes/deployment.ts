import { Router } from "express";
import * as DeploymentController from "../controllers/deployment";
import { authenticateRequest } from "../../middleware/auth";
import { asyncHandler, validateRequest } from "../../middleware/api-util";
import * as DeploymentSchema from "../../schema/deployment";
import { VALIDATION_ERR_MESSAGE } from "../../constants";

const router = Router();
const { create } = DeploymentSchema;

router.post(
  "/create",
  validateRequest({
    body: create,
    validationErrorMessage: VALIDATION_ERR_MESSAGE,
  }),
  //   authenticateRequest(),
  asyncHandler(DeploymentController.create)
);

export default router;
