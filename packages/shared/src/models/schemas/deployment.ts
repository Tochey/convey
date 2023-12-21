import { Schema } from "mongoose";

export const deploymentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: [
        "pending",
        "queued",
        "building",
        "deploying",
        "deployed",
        "failed",
      ],
    },
    github_url: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      default: "main",
    },
    buildCommand: {
      type: String,
      required: true,
    },
    startCommand: {
      type: String,
      required: true,
    },
    rootDirectory: {
      type: String,
      default: ".",
    },
    port: {
      type: Number,
      required: true,
    },
    deploy_url: {
      type: String,
    },
    logs: {
      type: [String],
    },
    env: {
      type: Schema.Types.Mixed,
    },
    type: {
      type: String,
      required: true,
      default: "LAMBDA",
      enum: ["LAMBDA", "CONTAINER"],
    },
  },
  { timestamps: true },
);
