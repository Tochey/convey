import { REFRESH_TOKEN_HEADER_KEY, X_TOKEN_HEADER_KEY } from "../../constants";
import { CustomResponse } from "../../utils/custom-res";
import { createTokens } from "../../utils/tokens";
import { Request } from "../../types";
import { IUser } from "@convey/shared";

export async function setHeaders(req: Request) {
  const { user } = req;
  if (!user) {
    return new CustomResponse("User not found", null, 404);
  }
  const [accessToken, refreshToken] = await createTokens({
    userId: (user as IUser)._id,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
  });

  return new CustomResponse(
    "Logged In Successfully",
    undefined,
    undefined,
    undefined,
    `${process.env.DOMAIN_CLIENT}/login?${X_TOKEN_HEADER_KEY}=${accessToken}&${REFRESH_TOKEN_HEADER_KEY}=${refreshToken}`
  );
}
