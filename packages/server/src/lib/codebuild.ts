import {
  CodeBuildClient,
  CreateProjectCommand,
  CreateProjectCommandInput,
  StartBuildCommand,
  StartBuildCommandInput,
} from "@aws-sdk/client-codebuild";
import CustomError from "../utils/custom-err";
import { spec } from "../utils/deploy-spec";
import { Types } from "mongoose";
import { DEPLOYMENT_PREFIX, IDeployment } from "@convey/shared";
import { loadParams } from "./load-params";
import { CODEBUILD_CONFIG } from "../constants";

type env = Array<{
  name:
    | "DEPLOYMENT"
    | "BUCKET_NAME"
    | "QUEUE_URL"
    | "DEPLOYMENT_AUTH_TOKEN"
    | "SERVER_URL";
  value: string;
}>;

const client = new CodeBuildClient({ region: "us-east-1" });

export async function createCBDeployment(
  props: IDeployment,
  credentials: string,
) {
  const cpcInput = await createProjectCommandInput(props, credentials);
  const sbcInput = startBuildCommandInput(props._id);

  try {
    await client.send(new CreateProjectCommand(cpcInput));
    await client.send(new StartBuildCommand(sbcInput));
  } catch (err) {
    console.error(err);
    throw new CustomError(500, "Something went wrong :(");
  }
}

async function createProjectCommandInput(
  props: IDeployment,
  credentials: string,
): Promise<CreateProjectCommandInput> {
  const env = await buildEnvironmentVariables(props);
  env.push({
    name: "DEPLOYMENT_AUTH_TOKEN",
    value: credentials,
  });

  return {
    name: `${DEPLOYMENT_PREFIX}${props._id}`,
    source: {
      type: "GITHUB",
      location: props.github_url,
      buildspec: spec,
    },
    artifacts: {
      type: "NO_ARTIFACTS",
    },
    environment: {
      type: "LINUX_LAMBDA_CONTAINER",
      computeType: CODEBUILD_CONFIG.compute,
      image: CODEBUILD_CONFIG.image,
      environmentVariables: env,
    },
    serviceRole:
      process.env.NODE_ENV === "production"
        ? process.env.CB_DEPLOYMENT_SERVICE_ROLE
        : "arn:aws:iam::332521570261:role/codebuild-convey-service-role",
  };
}

function startBuildCommandInput(id: Types.ObjectId): StartBuildCommandInput {
  return {
    projectName: `${DEPLOYMENT_PREFIX}${id}`,
  };
}

async function buildEnvironmentVariables(props: IDeployment): Promise<env> {
  const { bucketName, queueUrl } = await loadParams();

  return [
    {
      name: "DEPLOYMENT",
      value: JSON.stringify(props),
    },
    {
      name: "QUEUE_URL",
      value: queueUrl,
    },
    {
      name: "BUCKET_NAME",
      value: bucketName,
    },
    {
      name: "SERVER_URL",
      value: process.env.DOMAIN_SERVER!,
    },
  ];
}
