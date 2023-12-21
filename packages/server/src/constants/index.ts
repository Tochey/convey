export const VALIDATION_ERR_MESSAGE =
  "Please verify your request body and try again";
export const X_TOKEN_HEADER_KEY = "x-token";
export const REFRESH_TOKEN_HEADER_KEY = "x-refresh-token";
export const CONVEY_PARAM_PATH_PREFIX = "/convey/app";
export const CODEBUILD_CONFIG = {
  image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs18",
  compute: "BUILD_LAMBDA_4GB",
} as const;

export const ACCESS_TOKEN_EXPIRATION = "1m";
export const PRINCIPAL_TOKEN_EXPIRATION = "7d";
export const REFRESH_TOKEN_EXPIRATION = "7d";
