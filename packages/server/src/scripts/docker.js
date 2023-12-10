const fs = require("fs");

function main() {
  const dockerFile = createDockerFile();
  fs.writeFileSync("Dockerfile", dockerFile);
}

function createDockerFile() {
  const { rootDirectory, buildCommand, startCommand, port } = process.env;

  const sc = startCommand
    ?.split(" ")
    .map((com) => `"${com}"`)
    .join(",");

  const dockerFile = `
  FROM --platform=linux/amd64 node:19-alpine AS node
  COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter

  COPY ${rootDirectory}/ "/var/task"
  WORKDIR "/var/task"

  RUN apk --no-cache add curl && \
    touch .env && \
    ${buildCommand}

  EXPOSE ${port}
  CMD [${sc}]
  `;

  return dockerFile;
}

main();
