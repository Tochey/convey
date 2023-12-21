import { Types } from "mongoose";
import { User, IUser } from "@convey/shared";
import CustomError from "../utils/custom-err";

export async function getUser(id: Types.ObjectId): Promise<IUser> {
  const userInfo = await User.findById(id);

  if (!userInfo) {
    throw new CustomError(404, "User not found");
  }

  return userInfo;
}
