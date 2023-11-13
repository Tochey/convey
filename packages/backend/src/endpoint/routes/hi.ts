import { Router } from "express";
import * as HiController from "../controllers/hi";
import { authenticateRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/api-util";

const router = Router();

router.get("/", authenticateRequest(), asyncHandler(HiController.hi));

export default router;
