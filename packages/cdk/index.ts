#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Core, App } from "./stacks";

const app = new cdk.App();
new App(app, "ConveyApp", {
  env: {
    account: "332521570261",
    region: "us-east-1",
  },
});

new Core(app, "ConveyCore", {
  env: {
    account: "332521570261",
    region: "us-east-1",
  },
});
