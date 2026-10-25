import { and, asc, eq, gt } from "drizzle-orm";
import type { Database } from "../../config/db";
import { logbookMonths, logbookProfiles, type LogbookMonthDoc, type LogbookProfileDoc } from "./Logbook.model";

/** Neuer Stand für einen Datensatz; `baseRev` muss dem gespeicherten Stand entsprechen. */
export interface LogbookWrite<T> {
  baseRev: number;
  doc: T;
}

/**
 * Speicherzugriff des Fahrtenbuchs. `saveMonth`/`saveProfile` liefern null, wenn jemand anderes
 * (zweites Gerät) inzwischen gespeichert hat: Vergleich und Schreiben passieren in einer Anweisung.
 */
export interface LogbookRepository {
  findMonth(userId: string, month: string): Promise<LogbookMonthDoc | null>;
  listMonths(userId: string, since?: Date): Promise<LogbookMonthDoc[]>;
  saveMonth(write: LogbookWrite<LogbookMonthDoc>): Promise<LogbookMonthDoc | null>;
  findProfile(userId: string): Promise<LogbookProfileDoc | null>;
  saveProfile(write: LogbookWrite<LogbookProfileDoc>): Promise<LogbookProfileDoc | null>;
  deleteForUser(userId: string): Promise<number>;
}

export function pgLogbookRepository(db: Database): LogbookRepository {
  const monthKey = (userId: string, month: string) => and(eq(logbookMonths.userId, userId), eq(logbookMonths.month, month));

  return {
    async findMonth(userId, month) {
      const [row] = await db.select().from(logbookMonths).where(monthKey(userId, month)).limit(1);
      return row ?? null;
    },
    listMonths: (userId, since) =>
      db
        .select()
        .from(logbookMonths)
        .where(since ? and(eq(logbookMonths.userId, userId), gt(logbookMonths.updatedAt, since)) : eq(logbookMonths.userId, userId))
        .orderBy(asc(logbookMonths.month)),
    async saveMonth({ baseRev, doc }) {
      // Erstes Speichern: Hat ein anderes Gerät gleichzeitig angelegt, kommt keine Zeile zurück
      const [row] =
        baseRev === 0
          ? await db.insert(logbookMonths).values(doc).onConflictDoNothing().returning()
          : await db
              .update(logbookMonths)
              .set({ payload: doc.payload, rev: doc.rev, updatedAt: doc.updatedAt })
              .where(and(monthKey(doc.userId, doc.month), eq(logbookMonths.rev, baseRev)))
              .returning();
      return row ?? null;
    },
    async findProfile(userId) {
      const [row] = await db.select().from(logbookProfiles).where(eq(logbookProfiles.userId, userId)).limit(1);
      return row ?? null;
    },
    async saveProfile({ baseRev, doc }) {
      const [row] =
        baseRev === 0
          ? await db.insert(logbookProfiles).values(doc).onConflictDoNothing().returning()
          : await db
              .update(logbookProfiles)
              .set({ payload: doc.payload, rev: doc.rev, updatedAt: doc.updatedAt })
              .where(and(eq(logbookProfiles.userId, doc.userId), eq(logbookProfiles.rev, baseRev)))
              .returning();
      return row ?? null;
    },
    async deleteForUser(userId) {
      return db.transaction(async (tx) => {
        const months = await tx.delete(logbookMonths).where(eq(logbookMonths.userId, userId)).returning({ month: logbookMonths.month });
        const profiles = await tx.delete(logbookProfiles).where(eq(logbookProfiles.userId, userId)).returning({ userId: logbookProfiles.userId });
        return months.length + profiles.length;
      });
    },
  };
}
