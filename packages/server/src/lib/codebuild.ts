import {
  CodeBuildClient,
  CreateProjectCommand,
  CreateProjectCommandInput,
  StartBuildCommand,
  StartBuildCommandInput,
  CreateWebhookCommand,
  CreateWebhookCommandInput,
} from "@aws-sdk/client-codebuild";
import CustomError from "../utils/custom-err";
import { spec } from "../utils/deploySpec";

interface DeploymentProps {
  id: string;
  clone_url: string;
  branch: string;
}

const client = new CodeBuildClient({ region: "us-east-1" });

export async function createCBDeployment(props: DeploymentProps) {
  const { id, clone_url, branch } = props;
  const cpcInput = createProjectCommandInput(id, clone_url);
  const sbcInput = startBuildCommandInput(id);
  const wbcInput = createWebhookCommandInput(id, branch);

  try {
    await client.send(new CreateProjectCommand(cpcInput));
    await client.send(new CreateWebhookCommand(wbcInput));
    await client.send(new StartBuildCommand(sbcInput));
  } catch (err) {
    console.error(err);
    throw new CustomError(500, "Something went wrong :(");
  }
}

function createProjectCommandInput(
  id: string,
  clone_url: string
): CreateProjectCommandInput {
  return {
    name: id,
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
    },
    serviceRole:
      process.env.NODE_ENV === "production"
        ? process.env.CB_DEPLOYMENT_SERVICE_ROLE
        : "arn:aws:iam::332521570261:role/codebuild-convey-service-role",
  };
}

function startBuildCommandInput(id: string): StartBuildCommandInput {
  return {
    projectName: id,
  };
}

function createWebhookCommandInput(
  id: string,
  branch: string
): CreateWebhookCommandInput {
  return {
    projectName: id,
    branchFilter: branch,
  };
}
