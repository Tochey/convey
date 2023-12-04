import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class Core extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "convey-deployments", {
      bucketName: "convey-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new s3deploy.BucketDeployment(this, "scripts", {
      sources: [s3deploy.Source.asset("../../packages/server/src/scripts/")],
      destinationBucket: bucket,
      destinationKeyPrefix: "scripts",
    });

    const cbServeiceRole = new iam.Role(this, "CodeBuildServiceRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      roleName: "ConveyDeploymentServiceRole",
    });

    bucket.grantWrite(cbServeiceRole);

    const queue = new sqs.Queue(this, "convey-deployment-queue", {
      queueName: "convey-queue",
      visibilityTimeout: cdk.Duration.seconds(300),

    });
    queue.grantSendMessages(cbServeiceRole);

    const worker = new NodejsFunction(this, "worker", {
      entry: "src/functions/worker/index.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      projectRoot: "../../",
    });

    worker.addEventSource(new SqsEventSource(queue, {
      
    }));

    //TODO: create vpc and subnet configuration

    const cluster = new ecs.Cluster(this, "convey-cluster", {
      clusterName: "convey",
    });

    const td = new ecs.TaskDefinition(this, "kaniko-build", {
      memoryMiB: "32768",
      cpu: "16384",
      compatibility: ecs.Compatibility.FARGATE,
    });

    td.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
        ],
        resources: ["*"],
      })
    );

    const svc = new ecs.FargateService(this, "convey-service", {
      cluster: cluster,
      taskDefinition: td,
      serviceName: "kaniko",
      desiredCount: 0,
    });

    const container = td.addContainer("kaniko", {
      image: ecs.ContainerImage.fromAsset("."),
      memoryLimitMiB: 32768,
      logging: new ecs.AwsLogDriver({
        streamPrefix: "kaniko",
      }),
      command: [
        "--context",
        "${CONTEXT}",
        "--context-sub-path",
        "./api",
        "--dockerfile",
        "Dockerfile.v3",
        "--destination",
        "public.ecr.aws/v2p4u2r4/testsfsdf",
        "--force",
      ],
      environment: {
        AWS_SDK_LOAD_CONFIG: "true",
      },
    });

    new ssm.StringParameter(this, "url-param", {
      parameterName: "/convey/app/queueUrl",
      stringValue: queue.queueUrl,
    });

    new ssm.StringParameter(this, "bucket-param", {
      parameterName: "/convey/app/bucketName",
      stringValue: bucket.bucketName,
    });
  }
}
