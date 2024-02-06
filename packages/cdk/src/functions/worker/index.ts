import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  CreateFunctionUrlConfigCommand,
  AddPermissionCommand,
} from "@aws-sdk/client-lambda";
import {
  ECSClient,
  RunTaskCommand,
  DescribeTasksCommand,
} from "@aws-sdk/client-ecs";
import { SQSEvent } from "aws-lambda";
import { DEPLOYMENT_PREFIX, Deployment } from "@convey/shared";
import { connect } from "./connect";
import { Types } from "mongoose";

const region = "us-east-1";
const ecs = new ECSClient({ region });
const lambda = new LambdaClient({ region });
const repo =
  process.env.ECR_REPO_URI ??
  "332521570261.dkr.ecr.us-east-1.amazonaws.com/convey-test";

type ConveyQueueMessage = {
  userId: string;
  deploymentId: Types.ObjectId;
  s3Path: string;
};

type UpdateData = {
  status?: string;
  logs?: Array<string>;
};

export const handler = async (event: SQSEvent) => {
  const { Records } = event;
  const body = JSON.parse(Records[0].body) as ConveyQueueMessage;
  await connect();

  const config = await getDeploymentConfig(body.deploymentId);
  const { tasks } = await startBuildContainer(body);

  if (!tasks) throw new Error("No tasks found");

  for (const task of tasks) {
    const { taskArn } = task;
    if (!taskArn) throw new Error("No taskArn found");
    await pollBuildContainer(taskArn);
    await createDeployment(config);
  }
};

async function pollBuildContainer(taskArn: string) {
  const input = { cluster: "convey", tasks: [taskArn] };
  const command = new DescribeTasksCommand(input);
  let data;

  do {
    data = await ecs.send(command);
    if (!data.tasks || !data.tasks[0].containers)
      throw new Error("No tasks or containers found");
    await new Promise((resolve) => setTimeout(resolve, 200));
  } while (data.tasks[0].containers[0].lastStatus !== "STOPPED");
}

// TODO: S3 BUCKET KEY

async function startBuildContainer(body: ConveyQueueMessage) {
  await updatedDeploymentStatus(body.deploymentId, {
    status: "building",
    logs: [logMessage("Starting build container")],
  });

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
            "--context",
            body.s3Path,
            "--context-sub-path",
            "./",
            "--dockerfile",
            "Dockerfile",
            "--destination",
            `${repo}:${DEPLOYMENT_PREFIX}${body.deploymentId.toString()}`,
            "--force",
          ],
        },
      ],
    },
  });
  const data = await ecs.send(command);
  return data;
}

//TODO: figure out ecr repo stuff

async function createDeployment(
  config: Awaited<ReturnType<typeof getDeploymentConfig>>,
) {
  if (!config) throw new Error("No config found");

  await updatedDeploymentStatus(config._id, {
    status: "deploying",
    logs: [logMessage("Deploying serverless function")],
  });

  //TODO: add FUNCTION_ROLE_ARN to core lambda

  const id = `${DEPLOYMENT_PREFIX}${config._id.toString()}`;
  const command = new CreateFunctionCommand({
    FunctionName: id,
    Role:
      process.env.FUNCTION_ROLE_ARN ??
      "arn:aws:iam::332521570261:role/convey-lambda-role",
    Code: {
      ImageUri: `${repo}:${id}`,
    },
    PackageType: "Image",
    Timeout: 900,
    Environment: {
      Variables: {
        NPM_CONFIG_CACHE: "/tmp/.npm",
        AWS_LWA_READINESS_CHECK_PATH: "/health",
        AWS_LWA_PORT: config.port.toString(),
        ...config.env,
      },
    },
  });

  await lambda.send(command);
  await waitForFunctionToBeActive(id);
  await addPublicAccessPermission(id);
  await createFunctionDeployment(id, config);
}

async function waitForFunctionToBeActive(id: string) {
  let state: string | undefined;
  do {
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: id }),
    );
    if (Configuration) state = Configuration.State;
  } while (state !== "Active");
}

async function addPublicAccessPermission(id: string) {
  await lambda.send(
    new AddPermissionCommand({
      Action: "lambda:InvokeFunctionUrl",
      FunctionName: id,
      Principal: "*",
      StatementId: "FunctionURLAllowPublicAccess",
      FunctionUrlAuthType: "NONE",
    }),
  );
}

async function createFunctionDeployment(id: string, config: any) {
  const c = new CreateFunctionUrlConfigCommand({
    FunctionName: id,
    AuthType: "NONE",
  });
  const d = await lambda.send(c);
  try {
    await Deployment.findOneAndUpdate(
      { _id: config._id },
      { deploy_url: d.FunctionUrl },
    );

    await updatedDeploymentStatus(config._id, {
      status: "deployed",
      logs: [logMessage("Deployment successful")],
    });
  } catch (err) {
    console.log(err);
    await updatedDeploymentStatus(config._id, {
      status: "failed",
      logs: [logMessage("Deployment Failed")],
    });
  }
}

async function getDeploymentConfig(deploymentId: Types.ObjectId) {
  const config = await Deployment.findById(deploymentId);
  if (!config) throw new Error("No config found");
  return config;
}

async function updatedDeploymentStatus(
  deploymentId: Types.ObjectId,
  data: UpdateData,
) {
  const deployment = await Deployment.findOneAndUpdate(
    { _id: deploymentId },
    {
      $set: {
        status: data.status,
      },
      $push: {
        logs: data.logs,
      },
    },
    { new: true },
  );

  if (!deployment) throw new Error("No deployment found");
}

function logMessage(message: string) {
  return `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(
    2,
    "0",
  )} - ${message}`;
}

// function loadMockEvent() {
//   const dataPath = path.resolve(__dirname, "../../../data/mockQEvent.json");
//   const jsonString = fs.readFileSync(dataPath, "utf8");
//   return JSON.parse(jsonString);
// }
