import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "test/e2e/**/*.spec.{js,mjs,cjs,ts,mts,cts}",
    ],
  },
});
