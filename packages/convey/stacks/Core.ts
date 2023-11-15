import { StackContext, Api, EventBus } from "sst/constructs";
import { SubnetType, Vpc, SecurityGroup, Port } from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  Compatibility,
  FargateService,
  TaskDefinition,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

const APP_NAME = "convey";

export function Core({ stack }: StackContext) {
  const vpc = new Vpc(stack, "Vpc", {
    vpcName: APP_NAME,
    subnetConfiguration: [
      {
        name: "pb1",
        subnetType: SubnetType.PUBLIC,
      },
      {
        name: "pr1",
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    ],
    maxAzs: 2,
  });

  const cluster = new Cluster(stack, "Cluster", {
    clusterName: APP_NAME,
    containerInsights: true,
    vpc: vpc,
  });

  const lbSecurityGroup = new SecurityGroup(
    stack,
    "loadbalancerSecurityGroup",
    {
      securityGroupName: `${APP_NAME}-loadbalancer`,
      vpc: vpc,
    }
  );

  lbSecurityGroup.addIngressRule(
    lbSecurityGroup,
    Port.tcp(443),
    "allow https traffic"
  );
  lbSecurityGroup.addIngressRule(
    lbSecurityGroup,
    Port.tcp(80),
    "allow http traffic"
  );

  const loadbalancer = new ApplicationLoadBalancer(stack, "loadbalancer", {
    loadBalancerName: APP_NAME,
    vpc: vpc,
    internetFacing: true,
    deletionProtection: stack.environment !== "dev",
    securityGroup: lbSecurityGroup,
  });

  const td = new TaskDefinition(stack, "coreTaskDefinition", {
    cpu: "256",
    memoryMiB: "512",
    compatibility: Compatibility.EXTERNAL,
  });

  const svc = new FargateService(stack, "coreService", {
    serviceName: `${APP_NAME}-core`,
    cluster: cluster,
    vpcSubnets: {
      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    },
    taskDefinition: td,
  });

  /* 
  TODO: 
  create core stuff:
    - service
    - route53
  */
}
