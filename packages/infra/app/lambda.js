import app from ".";
const serverless = require("serverless-http");

export const handler = serverless(app);