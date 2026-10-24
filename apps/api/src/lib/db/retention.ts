import { sql } from "drizzle-orm";
import type { Database } from "../../config/db";

/**
 * Löschfristen. PostgreSQL hat keine TTL-Indizes wie MongoDB, deshalb meldet jedes Modul hier
 * seine Fristen an, und ein Job löscht stündlich. Abfragen, für die die Frist wichtig ist
 * (z. B. Login-Drosselung), filtern zusätzlich selbst nach Zeit und verlassen sich nicht auf den Job.
 */
export type RetentionExecutor = Pick<Database, "delete">;

export interface RetentionRule {
  name: string;
  /** Löscht alles außerhalb der Frist und gibt die Anzahl gelöschter Zeilen zurück. */
  purge: (db: RetentionExecutor, now: Date) => Promise<number>;
}

const HOUR_MS = 60 * 60 * 1000;
// Beliebige feste Zahl, damit nur eine von mehreren PM2-Instanzen gleichzeitig aufräumt
const RETENTION_LOCK_KEY = 4_204_202_026;

/** Löscht einmal alles außerhalb der Fristen. Gibt die Anzahl gelöschter Zeilen pro Regel zurück. */
export async function purgeExpired(db: Database, rules: RetentionRule[], now = new Date()): Promise<Record<string, number> | null> {
  return db.transaction(async (tx) => {
    const lock = await tx.execute<{ locked: boolean }>(sql`select pg_try_advisory_xact_lock(${RETENTION_LOCK_KEY}) as locked`);
    if (!lock.rows[0]?.locked) return null;
    const deleted: Record<string, number> = {};
    for (const rule of rules) deleted[rule.name] = await rule.purge(tx, now);
    return deleted;
  });
}

/** Startet den Aufräum-Job: sofort und dann stündlich. Gibt eine Stopp-Funktion zurück. */
export function startRetention(db: Database, rules: RetentionRule[], intervalMs = HOUR_MS): () => void {
  const run = () => {
    purgeExpired(db, rules).catch((error: Error) => console.error("[Aufräumen] Fehlgeschlagen:", error.message));
  };
  run();
  const timer = setInterval(run, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}

export const olderThan = (now: Date, ms: number) => new Date(now.getTime() - ms);
export const DAY_MS = 24 * HOUR_MS;
