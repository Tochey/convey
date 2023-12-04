import {
  GetObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  LambdaClient,
  CreateFunctionCommand,
  CreateFunctionCommandInput,
} from "@aws-sdk/client-lambda";
import fs from "fs";
import path from "path";

// polls from queue
const region = "us-east-1";

async function main() {
  const s3 = new S3Client({ region });
  const { Contents } = await s3.send(
    new ListObjectsCommand({
      Bucket: "convey-bucket",
      Prefix: "deployment/convey-deploy/",
    })
  );

  if (Contents) {
    for (const object of Contents) {
      const { Body } = await s3.send(
        new GetObjectCommand({
          Bucket: "convey-bucket",
          Key: object.Key,
        })
      );

      if (object.Key) {
        const localFilePath = path.join(
          "app",
          object.Key.replace("deployment/convey-deploy/", "")
        );
        await saveObjectToLocalFile(Body, localFilePath);
      }
    }
  }

  createDockerFile();
  buildImage();
}

const saveObjectToLocalFile = async (stream: any, filePath: string) => {
  const directory = path.dirname(filePath);
  await fs.promises.mkdir(directory, { recursive: true });
  await stream.pipe(fs.createWriteStream(filePath));
};

function createDockerFile() {
  const dockerFile = `
FROM --platform=linux/amd64 node:19-alpine AS node
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter

COPY . "/var/task"
WORKDIR "/var/task"

RUN apk --no-cache add curl && \
    touch .env && \
    npm ci

EXPOSE 8080
ENV HOST=0.0.0.0
CMD ["node", "index.js"]
`;

  fs.writeFileSync(path.join("app", "Dockerfile"), dockerFile);
}

function buildImage() {
  const { spawn } = require("child_process");
  const docker = spawn("docker", ["build", "-t", "convey", "."], {
    cwd: path.join(process.cwd(), "app"),
  });

  docker.stdout.on("data", (data: any) => {
    console.log(data);
  });

  docker.stderr.on("data", (data: any) => {
    console.error(`stderr: ${data}`);
  });

  docker.on("close", (code: any) => {
    console.log(`child process exited with code ${code}`);
  });

  //write code to  push the image to ecr
}

async function provisionInfrastructure() {
  const lambda = new LambdaClient({ region });
  const params: CreateFunctionCommandInput = {
    Code: {
      ImageUri: "convey",
    },
    FunctionName: "convey",
    PackageType: "Image",
    Role: "arn:aws:iam::332521570261:role/convey-lambda-role",
  };
  
  const response = await lambda.send(new CreateFunctionCommand(params));
}

main().catch(console.error);

// build project (appending docker file to root)w

// deploys infra

// goes back to polling
