import { SSTConfig } from "sst";
import { Core } from "./stacks/Core";

export default {
  config(_input) {
    return {
      name: "convey",
      region: "us-east-1",
      profile: "convey",
    };
  },
  stacks(app) {
    app.stack(Core);
  }
} satisfies SSTConfig;
