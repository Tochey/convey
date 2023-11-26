import { SSTConfig } from "sst";
import { Core } from "./stacks/Core";
import { App } from "./stacks/App";

export default {
  config(_input) {
    return {
      name: "convey",
      region: "us-east-1",
      profile: "convey",
    };
  },
  stacks(app) {
    // app.stack(Core);
    app.stack(App);
  },
} satisfies SSTConfig;
