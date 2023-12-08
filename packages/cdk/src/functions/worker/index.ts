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
import mongoose, { mongo } from "mongoose";

const ecs = new ECSClient({ region: "us-east-1" });
const lambda = new LambdaClient({ region: "us-east-1" });

type ConveyMessage = {
  userId: string;
  deploymentId: string;
  s3Path: string;
};

export const handler: Handler<SQSEvent> = async (event) => {
  const { Records } = event;
  const body = JSON.parse(Records[0].body) as ConveyMessage;

  const config = await getDeploymentConfig(body.deploymentId);
  const { tasks } = await startBuildContainer(body);

  // if (!tasks) {
  //   throw new Error("No tasks found");
  // }

  // for (const task of tasks) {
  //   const { taskArn } = task;

  //   if (!taskArn) {
  //     throw new Error("No taskArn found");
  //   }

  //   await pollBuildContainer(taskArn);
  //   await createDeployment();
  // }
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

async function startBuildContainer(body: ConveyMessage) {
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

async function createDeployment() {
  const command = new CreateFunctionCommand({
    FunctionName: "convey-test",
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
        AWS_LWA_PORT: "3000",
      },
    },
  });

  const data = await lambda.send(command);

  let state: string | undefined;

  const { Configuration } = await lambda.send(
    new GetFunctionCommand({ FunctionName: "convey-test" })
  );

  if (Configuration) {
    state = Configuration.State;
  }

  while (state !== "Active") {
    const { Configuration } = await lambda.send(
      new GetFunctionCommand({ FunctionName: "convey-test" })
    );

    if (Configuration) {
      state = Configuration.State;
    }
  }

  const r = await lambda.send(
    new AddPermissionCommand({
      Action: "lambda:InvokeFunctionUrl",
      FunctionName: "convey-test",
      Principal: "*",
      StatementId: "FunctionURLAllowPublicAccess",
      FunctionUrlAuthType: "NONE",
    })
  );

  const c = new CreateFunctionUrlConfigCommand({
    FunctionName: "convey-test",
    AuthType: "NONE",
  });

  const d = await lambda.send(c);

  console.log(d.FunctionUrl);
}

async function getDeploymentConfig(deploymentId: string) {
  const model = await initDB();
  const config = await model.findOne({
    _id: new mongo.ObjectId(deploymentId),
  });


  return config 
}

async function initDB() {
  const uri =
    (process.env.MONGO_URI as string) ?? "mongodb://localhost:27017/convey";

  await mongoose.connect(uri);
  return mongoose.model("Deployment", new mongoose.Schema({}));
}
