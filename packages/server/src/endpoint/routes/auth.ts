import { Router } from "express";
import * as AuthController from "../controllers/auth";
import z from "zod";
import { asyncHandler, validateRequest } from "../../middleware/api-util";
import { VALIDATION_ERR_MESSAGE } from "../../constants";

const router = Router();

const register = z
  .object({
    name: z.string().min(3).max(80),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .refine((value) => value.trim().length > 0, {
        message: "Password cannot be only spaces",
      }),
    confirm_password: z
      .string()
      .min(8)
      .max(128)
      .refine((value) => value.trim().length > 0, {
        message: "Password cannot be only spaces",
      }),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
      });
    }
  });

const login = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => value.trim().length > 0, {
      message: "Password cannot be only spaces",
    }),
});

router.post(
  "/register",
  validateRequest({
    body: register,
    validationErrorMessage: VALIDATION_ERR_MESSAGE,
  }),
  asyncHandler(AuthController.register)
);

router.post(
  "/login",
  validateRequest({
    body: login,
    validationErrorMessage: VALIDATION_ERR_MESSAGE,
  }),
  asyncHandler(AuthController.login)
);

export default router;
