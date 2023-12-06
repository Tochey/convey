import mongoose from "mongoose";
import { userSchema } from "./schemas/user";

export const User = mongoose.model("User", userSchema);
