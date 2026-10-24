import { randomBytes } from "node:crypto";
import { Client } from "pg";
import { createDatabase, type DatabaseHandle } from "../../config/db";
import { runMigrations } from "../../lib/db/migrate";

/** Postgres für Datenbank-Tests (in der CI ein postgres-Service). Fehlt die Variable, werden sie übersprungen. */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

export interface TestDatabase extends DatabaseHandle {
  drop(): Promise<void>;
}

/**
 * Legt pro Testdatei eine eigene, frisch migrierte Datenbank an, damit parallel laufende
 * Dateien sich nicht in die Quere kommen. `drop()` räumt sie danach wieder weg.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL fehlt");
  const name = `vf_test_${randomBytes(6).toString("hex")}`;
  const admin = new Client({ connectionString: TEST_DATABASE_URL });
  await admin.connect();
  await admin.query(`create database ${name}`);
  await admin.end();

  const url = new URL(TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  const handle = createDatabase(url.toString());
  await runMigrations(handle.db);

  return {
    ...handle,
    async drop() {
      await handle.close();
      const cleanup = new Client({ connectionString: TEST_DATABASE_URL });
      await cleanup.connect();
      await cleanup.query(`drop database if exists ${name} with (force)`);
      await cleanup.end();
    },
  };
}
