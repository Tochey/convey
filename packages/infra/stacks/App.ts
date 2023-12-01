import { Api, StackContext } from "sst/constructs";

export function App({ stack }: StackContext) {
  const api = new Api(stack, "Api", {
    routes: {
      "ANY  /{proxy+}": {
        function: {
          handler: "app/lambda.handler",
          timeout: 10,
          environment: { myName: "Tochi" },
        },
      },
    },
  });
}
