import { InferSchemaType, Types } from "mongoose";
import { userSchema } from "./models/schemas/user";
import { deploymentSchema } from "./models/schemas/deployment";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type IUser = Optional<
  InferSchemaType<typeof userSchema>,
  "createdAt" | "updatedAt" // timestamps are automatically added by mongoose
> & { _id: Types.ObjectId };

export type IDeployment = Optional<
  InferSchemaType<typeof deploymentSchema>,
  "createdAt" | "updatedAt" // timestamps are automatically added by mongoose
> & { _id: Types.ObjectId };

export type ConveyQueueMessage = {
  userId: string;
  deploymentId: string;
  s3Path: string;
};
