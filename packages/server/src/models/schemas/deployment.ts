import { Schema } from "mongoose";

export const deploymentSchema = new Schema(
  {
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
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    deploy_url: {
      type: String,
    },
  },
  { timestamps: true }
);
