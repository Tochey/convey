import { Handler, NextFunction, Response } from "express";
// import { verifyToken } from '../utils/token'

import CustomError from "../utils/custom-err";
import { JsonWebTokenError } from "jsonwebtoken";
import { DecodedToken, Request } from "../types";
import { REFRESH_TOKEN_HEADER_KEY, X_TOKEN_HEADER_KEY } from "../constants";
import { validateToken } from "../utils/tokens";

function authenticateRequest(): Handler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token: DecodedToken;
    const headers = req.headers;
    const accessToken = headers[X_TOKEN_HEADER_KEY] as string;
    const refreshToken = headers[REFRESH_TOKEN_HEADER_KEY] as string;
    try {
      if (accessToken && refreshToken) {
        token = await validateToken(accessToken, refreshToken, _res);
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
      return next(new CustomError(401, err.message));
    }
    next();
  };
}

function authenticateWithBody(body: Request["body"]): DecodedToken {
  const { id } = body;

  if (!id) {
    throw new CustomError(
      401,
      "Running authorization in dev mode but still no uid was provided"
    );
  }

  return {
    id,
  };
}

export { authenticateRequest };
