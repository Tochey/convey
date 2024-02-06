import {
  DEPLOYMENT_PREFIX,
  Deployment,
  IDeployment,
  Optional,
} from "@convey/shared";
import CustomError from "../utils/custom-err";
import { Types } from "mongoose";
import {
  CodeBuildClient,
  DeleteProjectCommand,
} from "@aws-sdk/client-codebuild";

import {
  LambdaClient,
  DeleteFunctionCommand,
  DeleteFunctionUrlConfigCommand,
} from "@aws-sdk/client-lambda";

import { ECRClient, BatchDeleteImageCommand } from "@aws-sdk/client-ecr";

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
  await deleteDeploymentInfrastructure(deploymentId);
  const deployment = await Deployment.findOneAndDelete({ _id: deploymentId });

  if (!deployment) {
    throw new CustomError(404, "Deployment not found");
  }

  return deployment;
}

async function deleteDeploymentInfrastructure(deploymentId: Types.ObjectId) {
  const region = "us-east-1";
  const deploymentPrefix = `${DEPLOYMENT_PREFIX}${deploymentId.toString()}`;

  const codebuild = new CodeBuildClient({ region });
  const lambda = new LambdaClient({ region });
  const ecr = new ECRClient({ region });

  try {
    await codebuild.send(new DeleteProjectCommand({ name: deploymentPrefix }));
    await deleteLambdaFunction(lambda, deploymentPrefix);
    await ecr.send(
      new BatchDeleteImageCommand({
        repositoryName: "convey", //TODO: pass this in through env
        imageIds: [{ imageTag: deploymentPrefix }],
      }),
    );
  } catch (err) {
    console.error(err);
    throw new CustomError(
      500,
      "Something went wrong deleting the project. Try again later :(",
    );
  }
}

async function deleteLambdaFunction(
  lambda: LambdaClient,
  deploymentPrefix: string,
) {
  const deleteFunctionUrlConfigCommand = new DeleteFunctionUrlConfigCommand({
    FunctionName: deploymentPrefix,
  });
  await lambda.send(deleteFunctionUrlConfigCommand);

  const deleteFunctionCommand = new DeleteFunctionCommand({
    FunctionName: deploymentPrefix,
  });
  await lambda.send(deleteFunctionCommand);
}
