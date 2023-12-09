import {
  ECSClient,
  RunTaskCommand,
  DescribeTasksCommand,
} from "@aws-sdk/client-ecs";
import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  CreateFunctionUrlConfigCommand,
  AddPermissionCommand,
} from "@aws-sdk/client-lambda";
import { SQSEvent, Handler } from "aws-lambda";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Deployment } from "@convey/shared";
import { connect } from "./connect";

const ecs = new ECSClient({ region: "us-east-1" });
const lambda = new LambdaClient({ region: "us-east-1" });

type ConveyQueueMessage = {
  userId: string;
  deploymentId: string;
  s3Path: string;
};

export const handler = async (event: SQSEvent) => {
  const { Records } = event;
  const body = JSON.parse(Records[0].body) as ConveyQueueMessage;

  await connect();
  const config = await getDeploymentConfig(body.deploymentId);
  const { tasks } = await startBuildContainer(body);

  if (!tasks) {
    throw new Error("No tasks found");
  }
  for (const task of tasks) {
    const { taskArn } = task;
    if (!taskArn) {
      throw new Error("No taskArn found");
    }
    await pollBuildContainer(taskArn);
    await createDeployment(config.toObject());
  }
};

async function pollBuildContainer(taskArn: string) {
  const input = {
    cluster: "convey",
    tasks: [taskArn],
  };

  const command = new DescribeTasksCommand(input);
  const data = await ecs.send(command);

  if (!data.tasks) {
    throw new Error("No tasks found");
  }

  const { containers } = data.tasks[0];

  if (!containers) {
    throw new Error("No containers found");
  }

  let status = containers[0].lastStatus;

  do {
    const { tasks } = await ecs.send(command);

    if (!tasks) {
      throw new Error("No tasks found");
    }

    const { containers } = tasks[0];

    if (!containers) {
      throw new Error("No containers found");
    }

    const container = containers[0];
    status = container.lastStatus;

    await new Promise((resolve) => setTimeout(resolve, 200));
  } while (status !== "STOPPED");
}

async function startBuildContainer(body: ConveyQueueMessage) {
  const command = new RunTaskCommand({
    cluster: "convey",
    taskDefinition: "ConveyCorekanikobuild70270354",
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ["subnet-0dfc0c865fe362bea", "subnet-0986bc8074960363d"],
        securityGroups: ["sg-0bc9b53b44ac64853"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "kaniko",
          command: [
            "--verbosity",
            "trace",
            "--context",
            body.s3Path,
            "--context-sub-path",
            "./",
            "--dockerfile",
            "Dockerfile",
            "--destination",
            "332521570261.dkr.ecr.us-east-1.amazonaws.com/convey-test:latest",
            "--force",
          ],
        },
      ],
    },
  });
  const data = await ecs.send(command);

  return data;
}

async function createDeployment(config: any) {
  if (!config) {
    throw new Error("No config found");
  }

  const id = `dply-${config._id.toString()}`;
  const command = new CreateFunctionCommand({
    FunctionName: id,
    Role: "arn:aws:iam::332521570261:role/convey-lambda-role",
    Code: {
      ImageUri:
        "332521570261.dkr.ecr.us-east-1.amazonaws.com/convey-test:latest",
    },
    PackageType: "Image",
    Timeout: 900,
    Environment: {
      Variables: {
        NPM_CONFIG_CACHE: "/tmp/.npm",
        AWS_LWA_READINESS_CHECK_PATH: "/health",
        AWS_LWA_PORT: config.port.toString(),
      },
    },
  });

  const data = await lambda.send(command);

  let state: string | undefined;

  const { Configuration } = await lambda.send(
    new GetFunctionCommand({ FunctionName: id })
  );

  if (Configuration) {
    state = Configuration.State;
  }

  while (state !== "Active") {
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: id })
    );

    if (Configuration) {
      state = Configuration.State;
    }
  }

  const r = await lambda.send(
    new AddPermissionCommand({
      Action: "lambda:InvokeFunctionUrl",
      FunctionName: id,
      Principal: "*",
      StatementId: "FunctionURLAllowPublicAccess",
      FunctionUrlAuthType: "NONE",
    })
  );

  console.log("creating function deployment");

  const c = new CreateFunctionUrlConfigCommand({
    FunctionName: id,
    AuthType: "NONE",
  });

  const d = await lambda.send(c);
  try {
    await Deployment.findOneAndUpdate(
      {
        _id: config._id,
      },
      {
        deploy_url: d.FunctionUrl,
      }
    );
  } catch (err) {
    console.log(err);
  }

  console.log("function deployment created");
}

async function getDeploymentConfig(deploymentId: string) {
  const config = await Deployment.findById(
    new mongoose.Types.ObjectId(deploymentId)
  );

  if (!config) {
    throw new Error("No config found");
  }
  console.log(config);

  return config;
}

function loadMockEvent() {
  const dataPath = path.resolve(__dirname, "../../../data/mockQEvent.json");
  const jsonString = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(jsonString);
}

handler(loadMockEvent());
