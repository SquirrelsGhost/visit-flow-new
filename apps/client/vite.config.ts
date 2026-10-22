import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // In der Entwicklung über denselben Ursprung, damit das Refresh-Cookie (SameSite=Strict) mitgeht
  server: { port: 5173, proxy: { "/api": "http://localhost:3001" } },
  build: { outDir: "dist", sourcemap: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
