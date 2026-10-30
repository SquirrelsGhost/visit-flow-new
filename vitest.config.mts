import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Gleicher Pfad-Alias wie in tsconfig.json
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".claude-tmp"],
    setupFiles: ["./src/__tests__/setup.ts"],
    testTimeout: 15000,
  },
});
