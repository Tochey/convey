import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { User } from "../models/User";
import CustomError from "./custom-err";
import { DecodedToken } from "../types";
import { Response } from "express";
import { REFRESH_TOKEN_HEADER_KEY, X_TOKEN_HEADER_KEY } from "../constants";

type params = {
  userId: Types.ObjectId;
  refreshSecret: string;
};

export async function createTokens({ userId, refreshSecret }: params) {
  const createAccessToken = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "1m",
    }
  );

  const createRefreshToken = jwt.sign(
    {
      id: userId,
    },
    refreshSecret,
    {
      expiresIn: "7d",
    }
  );

  return Promise.all([createAccessToken, createRefreshToken]);
}

async function refresh(token: string, res: Response) {
  let userRefreshSecret: string;
  try {
    const { id } = jwt.decode(token) as DecodedToken;

    if (!id) {
      throw new CustomError(401, "Unauthorized");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new CustomError(401, "Unauthorized");
    }
    try {
      // for non oath users
      userRefreshSecret =
        (process.env.JWT_REFRESH_SECRET as string) + user.password;

      jwt.verify(token, userRefreshSecret);
    } catch (err) {
      userRefreshSecret = process.env.JWT_REFRESH_SECRET as string;
      jwt.verify(token, userRefreshSecret);
    }

    const [accessToken, refreshToken] = await createTokens({
      userId: user._id,
      refreshSecret: userRefreshSecret,
    });

    res.setHeader(X_TOKEN_HEADER_KEY, accessToken);
    res.setHeader(REFRESH_TOKEN_HEADER_KEY, refreshToken);

    return { id } as DecodedToken;
  } catch (err) {
    throw new CustomError(500, "Failed to refresh token");
  }
}

export async function validateToken(
  accessToken: string,
  refreshToken: string,
  res: Response
) {
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string
    ) as DecodedToken;
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return await refresh(refreshToken, res);
    }
    throw new CustomError(401, "Unauthorized");
  }
}
