// https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
// https://stackoverflow.com/questions/3487991/why-does-oauth-v2-have-both-access-and-refresh-tokens

import { User } from "../../models/User";
import { Request } from "../../types";
import { CustomResponse } from "../../utils/custom-res";
import bcrypt from "bcrypt";
import CustomError from "../../utils/custom-err";
import { createTokens } from "../../utils/tokens";

export async function register(req: Request) {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.info("Register: User already exists");
    return new CustomResponse("User already exists", null, 400);
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = await User.create({
    email,
    password: hash,
    name,
  });

  return new CustomResponse("User Created", user);
}

export async function login(req: Request) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      // github users don't have passwords
      throw new CustomError(401, "Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new CustomError(401, "Invalid Credentials");
    }

    const [accessToken, refreshToken] = await createTokens({
      userId: user._id,
      refreshSecret: process.env.JWT_REFRESH_SECRET! + user.password,
    });

    return new CustomResponse("Logged In Successfully", null, undefined, {
      X_TOKEN_HEADER_KEY: accessToken,
      REFRESH_TOKEN_HEADER_KEY: refreshToken,
    });
  } catch (err) {
    console.log(err);
    return new CustomResponse("Someething went wrong", null, 500);
  }
}
