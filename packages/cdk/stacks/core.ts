import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";

export class Core extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const scheduler = new NodejsFunction(this, "scheduler", {
      functionName: "scheduler",
      entry: "src/functions/scheduler/index.ts",
      projectRoot: "../../",
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });
  }
}
