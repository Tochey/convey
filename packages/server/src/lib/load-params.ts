import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient({ region: "us-east-1" });

type ConveySSMParams = {
  bucketName: string;
  queueUrl: string;
};

export async function loadParams() {
  const { Parameters } = await client.send(
    new GetParametersByPathCommand({
      Path: "/convey",
      Recursive: true,
      WithDecryption: true,
    }),
  );

  if (!Parameters) {
    throw new Error("No parameters found");
  }

  const config: ConveySSMParams = {
    bucketName: "",
    queueUrl: "",
  };

  Parameters?.forEach((param) => {
    const key = param.Name?.split("/").pop();
    if (key) {
      config[key] = param.Value;
    }
  });

  return config;
}
