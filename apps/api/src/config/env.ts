import { z } from "zod";

const secret = (name: string) => z.string().min(32, `${name} muss mindestens 32 Zeichen lang sein`);

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3002),
    CORS_ORIGINS: z
      .string()
      .default("")
      .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
    MONGO_URI: z.string().min(1),
    JWT_SECRET: secret("JWT_SECRET"),
    DATA_CIPHER_KEY: secret("DATA_CIPHER_KEY"),
    BLIND_INDEX_KEY: secret("BLIND_INDEX_KEY"),
    CONSENT_LOG_DAYS: z.coerce.number().int().positive().default(1095),
    // Enes (KI-Coach). Ohne Endpoint und Key läuft die App mit lokalem Wissen weiter.
    AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
    AZURE_OPENAI_API_KEY: z.string().min(1).optional(),
    AZURE_OPENAI_DEPLOYMENT: z.string().min(1).default("gpt-4o"),
    AZURE_OPENAI_API_VERSION: z.string().min(1).default("2024-10-21"),
    COPILOT_MEMORY_DAYS: z.coerce.number().int().positive().default(180),
    COPILOT_LOG_DAYS: z.coerce.number().int().positive().default(90),
  })
  .refine((env) => env.DATA_CIPHER_KEY !== env.BLIND_INDEX_KEY, {
    message: "DATA_CIPHER_KEY und BLIND_INDEX_KEY müssen verschieden sein",
    path: ["BLIND_INDEX_KEY"],
  });

export type Env = z.infer<typeof envSchema>;

/** Liest und prüft die Umgebung einmal beim Start. Fehlt etwas, startet der Server nicht. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Ungültige Umgebung:\n${problems.join("\n")}`);
  }
  return result.data;
}
