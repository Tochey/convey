import { Response, NextFunction, RequestHandler } from "express";
import { CustomResponse, handleCustomResponse } from "../utils/custom-res";
import { ZodError, ZodTypeAny } from "zod";
import CustomError from "../utils/custom-err";
import { Request } from "../types";

type AsyncHandler = (
  req: Request,
  res?: Response
) => Promise<CustomResponse>;

const emptyMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => next();

/**
 * This utility serves as an alternative to wrapping express handlers with try/catch statements.
 * Any routes that use an async handler function should wrap the handler with this function.
 * Without this, any errors thrown will not be caught by the error handling middleware, and
 * the app will hang!
 */

function asyncHandler(handler: AsyncHandler): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const handlerData = await handler(req, res);
      return handleCustomResponse(handlerData, res);
    } catch (error) {
      next(error);
    }
  };
}
interface ValidationSchema {
  body?: object;
  validationErrorMessage?: string;
}

function validateRequest(validationSchema: ValidationSchema): RequestHandler {
  /**
   * In dev environments, as an alternative to token authentication,
   * you can pass the authentication middleware by having a user id in the body.
   * Inject the user id into the schema so that validation will not fail.
   */
  // if (process.env.NODE_ENV === 'dev') {
  //     validationSchema.body = z.any().optional();
  // }

  const { validationErrorMessage } = validationSchema;
  const normalizedValidationSchema = Object.fromEntries(
    Object.entries(validationSchema).filter(
      ([key]) => key !== "validationErrorMessage"
    )
  );

  return (req, res, next) => {
    for (const [key, schema] of Object.entries(normalizedValidationSchema)) {
      const zodSchema: ZodTypeAny = schema;
      try {
        zodSchema.parse(req[key] ?? {});
      } catch (err: ZodError | unknown) {
        let errMessage = "Invalid request body";
        if (err instanceof ZodError) {
          errMessage = err.issues.map((issue) => issue.message).join("\n");
        }
        throw new CustomError(422, errMessage ?? validationErrorMessage);
      }
    }

    next();
  };
}

function useInProduction(middlewares: RequestHandler[]): RequestHandler[] {
  return middlewares.map((middleware) =>
    process.env.NODE_ENV === "dev" ? emptyMiddleware : middleware
  );
}

export { asyncHandler, useInProduction, validateRequest };
