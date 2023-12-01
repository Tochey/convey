import { Octokit } from "@octokit/core";
import {
  CodeBuildClient,
  CreateProjectCommand,
  CreateProjectCommandInput,
} from "@aws-sdk/client-codebuild";

const client = new CodeBuildClient({ region: "us-east-1" });

export const handler = async (event: any = {}): Promise<any> => {
  const octokit = new Octokit();

  const {
    data: { clone_url },
  } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: "tochey",
    repo: "convey",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const input: CreateProjectCommandInput = {
    name: "convey",
    source: {
      type: "GITHUB",
      location: clone_url,
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
      "arn:aws:iam::332521570261:role/codebuild-convey-service-role",
  };

  const command = new CreateProjectCommand(input);
  const response = await client.send(command);

  console.log(response)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from scheduler!",
      input: event,
    }),
  };
};
