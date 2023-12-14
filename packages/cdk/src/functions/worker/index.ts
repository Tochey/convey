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

const region = "us-east-1";
const ecs = new ECSClient({ region });
const lambda = new LambdaClient({ region });

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

async function createDeployment(config: Awaited<ReturnType<typeof getDeploymentConfig>>) {
  if (!config) throw new Error("No config found");

  console.log(config);

  const id = `${DEPLOYMENT_PREFIX}${config._id.toString()}`;
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
  } catch (err) {
    console.log(err);
  }
}

async function getDeploymentConfig(deploymentId: string) {
  const config = await Deployment.findById(deploymentId);
  if (!config) throw new Error("No config found");
  return config;
}

// function loadMockEvent() {
//   const dataPath = path.resolve(__dirname, "../../../data/mockQEvent.json");
//   const jsonString = fs.readFileSync(dataPath, "utf8");
//   return JSON.parse(jsonString);
// }
