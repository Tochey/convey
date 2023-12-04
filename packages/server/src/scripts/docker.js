const fs = require("fs");

const { ROOT_DIRECTORY, BUILD_COMMAND, START_COMMAND, PORT } = process.env;

function main() {
  const dockerFile = createDockerFile();
  fs.writeFileSync("Dockerfile", dockerFile);
}

function createDockerFile() {
  const startCommand = START_COMMAND?.split(" ")
    .map((com) => `"${com}"`)
    .join(",");

  const dockerFile = `
  FROM --platform=linux/amd64 node:19-alpine AS node
  COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter

  COPY ${ROOT_DIRECTORY}/ "/var/task"
  WORKDIR "/var/task"

  RUN apk --no-cache add curl && \
    touch .env && \
    ${BUILD_COMMAND}

  EXPOSE ${PORT}
  CMD [${startCommand}]
  `;

  return dockerFile;
}

main();
