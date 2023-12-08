import {
  CodeBuildClient,
  CreateProjectCommand,
  CreateProjectCommandInput,
  StartBuildCommand,
  StartBuildCommandInput,
} from "@aws-sdk/client-codebuild";
import CustomError from "../utils/custom-err";
import { spec } from "../utils/deploySpec";
import { Types } from "mongoose";

interface DeploymentProps {
  userId : Types.ObjectId;
  deploymentId: Types.ObjectId;
  clone_url: string;
  branch: string;
  rootDirectory: string;
  buildCommand: string;
  startCommand: string;
  port: string;
}

const client = new CodeBuildClient({ region: "us-east-1" });

export async function createCBDeployment(props: DeploymentProps) {
  const cpcInput = createProjectCommandInput(props);
  const sbcInput = startBuildCommandInput(props.deploymentId);

  try {
    await client.send(new CreateProjectCommand(cpcInput));
    await client.send(new StartBuildCommand(sbcInput));
  } catch (err) {
    console.error(err);
    throw new CustomError(500, "Something went wrong :(");
  }
}

function createProjectCommandInput(
  props: DeploymentProps
): CreateProjectCommandInput {
  const { userId, deploymentId, clone_url, rootDirectory, startCommand, buildCommand, port } =
    props;
  return {
    name: `dply-${deploymentId}`,
    source: {
      type: "GITHUB",
      location: clone_url,
      buildspec: spec,
    },
    artifacts: {
      type: "NO_ARTIFACTS",
    },
    environment: {
      type: "LINUX_LAMBDA_CONTAINER",
      computeType: "BUILD_LAMBDA_4GB",
      image: "aws/codebuild/amazonlinux-x86_64-lambda-standard:nodejs18",
      environmentVariables: [
        {
          name: "ROOT_DIRECTORY",
          value: rootDirectory,
        },
        {
          name: "START_COMMAND",
          value: startCommand,
        },
        {
          name: "BUILD_COMMAND",
          value: buildCommand,
        },
        {
          name: "PORT",
          value: port,
        },
        {
          name: "DEPLOYMENT_ID",
          value: deploymentId.toString(),
        },
        {
          name: "USER_ID",
          value: userId.toString(),
        },
      ],
    },
    serviceRole:
      process.env.NODE_ENV === "production"
        ? process.env.CB_DEPLOYMENT_SERVICE_ROLE
        : "arn:aws:iam::332521570261:role/codebuild-convey-service-role",
  };
}

function startBuildCommandInput(id: Types.ObjectId): StartBuildCommandInput {
  return {
    projectName: `dply-${id}`,
  };
}
