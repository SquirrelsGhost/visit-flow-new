import { defineConfig } from "drizzle-kit";

/** Schema liegt in den Modulen (`*.model.ts`), die SQL-Migrationen in `drizzle/`. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/**/*.model.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
