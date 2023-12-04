import {
  ECSClient,
  RunTaskCommand
} from "@aws-sdk/client-ecs";

const client = new ECSClient({ region: "us-east-1" });

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
          "s3://convey-bucket/customer/builds/build.tar.gz",
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

const run = async () => {
  try {
    const data = await client.send(command);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

run();
