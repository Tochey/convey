import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Duration } from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";

export class App extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.DockerImageFunction(this, "dockerFN", {
      code: lambda.DockerImageCode.fromImageAsset("../../"),
      memorySize: 3000,
      timeout: Duration.seconds(10),
      environment: {
        NPM_CONFIG_CACHE: "/tmp/.npm",
        AWS_LWA_READINESS_CHECK_PATH : "/health"
      },
    });

    const endpoint = new apigw.LambdaRestApi(this, "endpoint", {
      handler: fn,
      proxy: true,
      restApiName: "convey_endpoint",
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });
  }
}
