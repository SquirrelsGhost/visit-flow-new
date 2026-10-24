import { createDatabase } from "../../config/db";
import { runMigrations } from "./migrate";

/**
 * `npm run db:migrate`: einmal pro Deploy, vor dem Start der API. Bewusst nicht beim Start jeder
 * PM2-Instanz, damit nicht mehrere Prozesse gleichzeitig dasselbe Schema ändern.
 */
async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL fehlt");
  const handle = createDatabase(url);
  try {
    await runMigrations(handle.db);
    console.info("[Migration] Schema ist aktuell");
  } finally {
    await handle.close();
  }
}

main().catch((error: unknown) => {
  console.error("[Migration] Fehlgeschlagen:", error);
  process.exit(1);
});
