import { Handler, NextFunction, Response } from "express";
// import { verifyToken } from '../utils/token'

import CustomError from "../utils/custom-err";
import { JsonWebTokenError } from "jsonwebtoken";
import { DecodedToken, Request } from "../types";

function authenticateRequest(): Handler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token: DecodedToken;
    const { authorization } = req.headers;
    try {
      if (authorization) {
        // token = verifyToken(authorization.split(' ')[1])
        token = {
          uid: "test",
        };
      } else if (process.env.NODE_ENV === "dev") {
        token = authenticateWithBody(req.body);
      } else {
        throw new CustomError(401, "Unauthorized");
      }
      req.ctx = {
        ...req.ctx,
        decodedToken: token,
      };
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        // if we fail to verify the token throw
        return next(new CustomError(401, err.message));
      }
      return next(err);
    }
    next();
  };
}

function authenticateWithBody(body: Request["body"]): DecodedToken {
  const { uid } = body;

  if (!uid) {
    throw new CustomError(
      401,
      "Running authorization in dev mode but still no uid was provided"
    );
  }

  return {
    uid,
  };
}

export { authenticateRequest };
