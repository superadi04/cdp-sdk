import { defineConfig } from "orval";

export default defineConfig({
  cdp: {
    input: {
      target: "../openapi.yaml",
    },
    output: {
      target: "./generated",
      mode: "tags-split",
      mock: {
        type: "msw",
        delay: 0,
        useExamples: false,
        indexMockFiles: true,
      },
      override: {
        mutator: {
          path: "./cdpApiClient.ts",
          name: "cdpApiClient",
        },
      },
      workspace: "./src/openapi-client",
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
