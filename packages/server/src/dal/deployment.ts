import { Deployment } from "@convey/shared";
import CustomError from "../utils/custom-err";
import { Types } from "mongoose";

export async function updateDeployment(deploymentId: Types.ObjectId, data: any) {
  const deployment = await Deployment.findOneAndUpdate(
    { _id: deploymentId },
    data,
    { new: true },
  );

  if (!deployment) {
    throw new CustomError(404, "Deployment not found");
  }

  return deployment;
}
