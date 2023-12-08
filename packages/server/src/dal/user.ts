import { Types } from "mongoose";
import { IUser } from "../types";
import { User } from "../models/User";
import CustomError from "../utils/custom-err";

export async function getUser(id: Types.ObjectId): Promise<IUser> {
  const userInfo = await User.findById(id);

  console.log(userInfo);

  if (!userInfo) {
    throw new CustomError(404, "User not found");
  }

  return userInfo;
}
