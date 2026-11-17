import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./openapi.json",
    output: {
      mode: "tags-split",
      target: "src/api/gen",
      schemas: "src/api/gen/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        fetch: {
          forceSuccessResponse: true,
        },
      },
    },
  },
});
