import { Deployment, IDeployment, Optional } from "@convey/shared";
import CustomError from "../utils/custom-err";
import { Types } from "mongoose";

type AllOptional<T> = Optional<T, keyof T>;

export async function updateDeployment(
  deploymentId: Types.ObjectId,
  data: AllOptional<IDeployment>,
) {
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

export async function deleteDeployment(deploymentId: Types.ObjectId) {
  const deployment = await Deployment.findOneAndDelete({ _id: deploymentId });

  if (!deployment) {
    throw new CustomError(404, "Deployment not found");
  }

  return deployment;
}
