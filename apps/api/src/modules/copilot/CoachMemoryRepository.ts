import { and, desc, eq, gt } from "drizzle-orm";
import type { CoachMemoryKind, CoachMemoryView } from "@visit-flow/shared/copilotSchema";
import type { Database } from "../../config/db";
import { readField, seal } from "../../lib/crypto/dataCipher";
import { isUuid } from "../../lib/db/ids";
import { DAY_MS } from "../../lib/db/retention";
import { coachMemories } from "./CoachMemory.model";

/** Gedächtnis von Enes. Der Service sieht nur Klartext; ver- und entschlüsselt wird hier. */
export interface CoachMemoryRepository {
  add(userId: string, kind: CoachMemoryKind, content: string, source: "user" | "enes"): Promise<CoachMemoryView>;
  /** Neueste zuerst, nur nicht abgelaufene. */
  list(userId: string, limit: number): Promise<CoachMemoryView[]>;
  remove(userId: string, id: string): Promise<boolean>;
  removeAll(userId: string): Promise<number>;
}

type StoredMemory = typeof coachMemories.$inferSelect;

export function pgCoachMemoryRepository(db: Database, cipherKey: string, retentionDays: number): CoachMemoryRepository {
  const view = (row: StoredMemory): CoachMemoryView => ({
    id: row.id,
    kind: row.kind,
    content: readField(row.content, cipherKey) ?? "",
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  });
  const owned = (userId: string, id: string) => and(eq(coachMemories.userId, userId), eq(coachMemories.id, id));
  return {
    async add(userId, kind, content, source) {
      const now = new Date();
      const [created] = await db
        .insert(coachMemories)
        .values({ userId, kind, source, content: seal(content, cipherKey), createdAt: now, expiresAt: new Date(now.getTime() + retentionDays * DAY_MS) })
        .returning();
      if (!created) throw new Error("Erinnerung wurde nicht gespeichert");
      return view(created);
    },
    async list(userId, limit) {
      const rows = await db
        .select()
        .from(coachMemories)
        .where(and(eq(coachMemories.userId, userId), gt(coachMemories.expiresAt, new Date())))
        .orderBy(desc(coachMemories.createdAt), desc(coachMemories.id))
        .limit(limit);
      return rows.map(view);
    },
    async remove(userId, id) {
      // Fremde IDs aus der Anfrage: PostgreSQL würde bei ungültiger UUID einen Fehler werfen
      if (!isUuid(id)) return false;
      return ((await db.delete(coachMemories).where(owned(userId, id))).rowCount ?? 0) === 1;
    },
    async removeAll(userId) {
      return (await db.delete(coachMemories).where(eq(coachMemories.userId, userId))).rowCount ?? 0;
    },
  };
}
