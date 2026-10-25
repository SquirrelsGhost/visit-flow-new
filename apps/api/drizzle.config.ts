import { defineConfig } from "drizzle-kit";

/** Schema liegt in den Modulen (`*.model.ts`, dazu die ID-Zuordnung der v1-Übernahme), die SQL-Migrationen in `drizzle/`. */
export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/modules/**/*.model.ts", "./src/migration/**/*.model.ts"],
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
