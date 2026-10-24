import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";

export type Database = NodePgDatabase;

export interface DatabaseHandle {
  db: Database;
  pool: Pool;
  /** true, wenn die Datenbank innerhalb von 2 Sekunden antwortet (für /api/health). */
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

/**
 * Spalten heißen im TypeScript camelCase und in der Datenbank snake_case. Dieselbe Einstellung
 * steht in drizzle.config.ts, damit generierte Migrationen und Abfragen zusammenpassen.
 */
export const DB_CASING = "snake_case";

/**
 * Verbindungspool zu PostgreSQL. Anders als bei Mongoose braucht es keine eigene Wiederverbindung:
 * Der Pool öffnet für jede Abfrage bei Bedarf eine neue Verbindung. Fällt die Datenbank weg,
 * scheitern nur die Anfragen in dieser Zeit, der Prozess läuft weiter.
 */
export function createDatabase(url: string): DatabaseHandle {
  const pool = new Pool({
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // Hängende Abfragen dürfen keine Verbindung blockieren
    statement_timeout: 15_000,
    application_name: "visit-flow-api",
  });
  // Ohne diesen Handler beendet ein Fehler auf einer ruhenden Verbindung den ganzen Prozess
  pool.on("error", (error) => console.error("[PostgreSQL] Fehler auf ruhender Verbindung:", error.message));
  const db = drizzle({ client: pool, casing: DB_CASING });

  return {
    db,
    pool,
    async ping() {
      try {
        await Promise.race([db.execute(sql`select 1`), new Promise((_, reject) => setTimeout(reject, 2_000).unref())]);
        return true;
      } catch {
        return false;
      }
    },
    close: () => pool.end(),
  };
}
