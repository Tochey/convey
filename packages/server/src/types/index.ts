import { InferSchemaType } from "mongoose";
import { userSchema } from "../models/schemas/user";

type ExpressRequest = import("express").Request;

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type IUser = Optional<
  InferSchemaType<typeof userSchema>,
  "createdAt" | "updatedAt" // timestamps are automatically added by mongoose
>;

export interface DecodedToken {
  id: string;
}

export interface Context {
  decodedToken: DecodedToken;
}

export interface Request extends ExpressRequest {
  ctx: Readonly<Context>;
}
