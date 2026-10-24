import { createApp } from "./app";
import { createServices } from "./services";
import { createDatabase } from "./config/db";
import { loadEnv } from "./config/env";
import { startRetention } from "./lib/db/retention";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  // Alle Datums- und Zeitwerte rechnen in deutscher Zeit (Stabilitäts-Audit 01.07.2026, Fix 11)
  process.env.TZ = "Europe/Berlin";
  const env = loadEnv();
  const database = createDatabase(env.DATABASE_URL);
  console.info(`[PostgreSQL] ${(await database.ping()) ? "Verbunden" : "Noch nicht erreichbar, Anfragen versuchen es erneut"}`);
  const services = createServices(env, database.db, database.ping);
  const stopRetention = startRetention(database.db, services.retention);
  const app = createApp(env, services);
  const server = app.listen(env.PORT, () => console.info(`[API] Läuft auf Port ${env.PORT}`));

  const shutdown = (signal: string) => {
    console.info(`[API] ${signal} empfangen, fahre herunter`);
    setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
    stopRetention();
    server.close(() => {
      void database.close().finally(() => process.exit(0));
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  // Unbekannter Zustand: sauber neu starten lassen (PM2), statt als Zombie weiterzulaufen
  process.on("uncaughtException", (error) => {
    console.error("[API] uncaughtException:", error);
    shutdown("uncaughtException");
  });
}

main().catch((error: unknown) => {
  console.error("[API] Start fehlgeschlagen:", error);
  process.exit(1);
});
