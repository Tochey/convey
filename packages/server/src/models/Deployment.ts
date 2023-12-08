import mongoose from "mongoose";
import { deploymentSchema } from "./schemas/deployment";

export const Deployment = mongoose.model("Deployment", deploymentSchema);
