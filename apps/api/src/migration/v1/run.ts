import { MongoClient } from "mongodb";
import { createDatabase } from "../../config/db";
import { runMigrations } from "../../lib/db/migrate";
import { migrateV1 } from "./migrateV1";
import { mongoV1Source, readConnectionStatus, writeAccessProblems } from "./source";

/**
 * Einmalige Übernahme von v1 (MongoDB, nur lesen) nach v2 (PostgreSQL).
 *
 *   V1_MONGO_URI=… DATABASE_URL=… npm run migrate:v1 -- --dry-run
 *
 * --dry-run                 alles ausführen, dann zurückrollen (Probe ohne Änderung)
 * --reset                   übernommene Tabellen vorher leeren (nur Proben, nicht mit NODE_ENV=production)
 * --accept-writable-source  auch starten, wenn der Mongo-Nutzer Schreibrechte hat (nur lokal)
 */
const args = new Set(process.argv.slice(2));

async function main(): Promise<void> {
  const mongoUri = process.env.V1_MONGO_URI;
  const databaseUrl = process.env.DATABASE_URL;
  if (!mongoUri || !databaseUrl) throw new Error("V1_MONGO_URI und DATABASE_URL müssen gesetzt sein");
  const reset = args.has("--reset");
  if (reset && process.env.NODE_ENV === "production") throw new Error("--reset ist mit NODE_ENV=production gesperrt");

  const mongo = new MongoClient(mongoUri, { readPreference: "secondaryPreferred", appName: "visit-flow-v2-migration" });
  const target = createDatabase(databaseUrl);
  try {
    await mongo.connect();
    const v1 = mongo.db();
    const problems = writeAccessProblems(await readConnectionStatus(v1));
    if (problems.length > 0 && !args.has("--accept-writable-source")) {
      throw new Error(`v1 bleibt read-only. Bitte mit einem Mongo-Nutzer mit Rolle "read" verbinden:\n- ${problems.join("\n- ")}`);
    }
    await runMigrations(target.db);
    const dryRun = args.has("--dry-run");
    const report = await migrateV1(target.db, mongoV1Source(v1), { dryRun, reset });
    console.info(report.summary());
    console.info(dryRun ? "[Migration v1] Probe: nichts gespeichert" : "[Migration v1] Fertig, alles in einer Transaktion gespeichert");
  } finally {
    await Promise.allSettled([mongo.close(), target.close()]);
  }
}

main().catch((error: unknown) => {
  console.error("[Migration v1] Abgebrochen:", error instanceof Error ? error.message : error);
  process.exit(1);
});
