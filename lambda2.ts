import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  CreateFunctionUrlConfigCommand,
  AddPermissionCommand,
} from "@aws-sdk/client-lambda";

async function main() {
  const client = new LambdaClient({ region: "us-east-1" });

  const command = new CreateFunctionCommand({
    FunctionName: "convey-test",
    Role: "arn:aws:iam::332521570261:role/convey-lambda-role",
    Code: {
      ImageUri:
        "332521570261.dkr.ecr.us-east-1.amazonaws.com/convey-test:latest",
    },
    PackageType: "Image",
    Timeout: 900,
    Environment : {
      Variables: {
        NPM_CONFIG_CACHE: "/tmp/.npm",
        AWS_LWA_READINESS_CHECK_PATH: "/health",
        AWS_LWA_PORT : "3000"
      }
    }
  });


  const data = await client.send(command);

  let state: string | undefined;

  const { Configuration } = await client.send(
    new GetFunctionCommand({ FunctionName: "convey-test" })
  );

  if (Configuration) {
    state = Configuration.State;
  }

  while (state !== "Active") {
    const { Configuration } = await client.send(
      new GetFunctionCommand({ FunctionName: "convey-test" })
    );

    if (Configuration) {
      state = Configuration.State;
    }
  }

  const r = await client.send(
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

  const d = await client.send(c);

  console.log(d.FunctionUrl);
}

const run = async () => {
  try {
    await main();
  } catch (error) {
    console.log(error);
  }
};

run();
