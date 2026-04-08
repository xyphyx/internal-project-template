import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "packages/**/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", "convex/_generated", ".next"],
    },
  },
  resolve: {
    alias: {
      "@xyphyx/shared": path.resolve(__dirname, "packages/shared/src"),
    },
  },
});
