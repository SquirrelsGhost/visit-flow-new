import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../../config/db";
import { readField, seal, type SealedValue } from "../../lib/crypto/dataCipher";
import { newObjectId } from "../../lib/db/objectId";
import { copilotLogs } from "./CopilotLog.model";

export interface CopilotExchange {
  question: string;
  reply: string;
}

/** Protokoll der Gespräche für 👍/👎 und die Beispiele, die bei einem Berater gewirkt haben. */
export interface CopilotLogRepository {
  insert(userId: string, vertical: string, exchange: CopilotExchange): Promise<string>;
  /** false, wenn der Eintrag nicht existiert oder einem anderen Nutzer gehört. */
  setFeedback(userId: string, logId: string, feedback: "up" | "down", reason?: string): Promise<boolean>;
  /** Neueste 👍-Antworten dieses Nutzers in dieser Sparte. */
  liked(userId: string, vertical: string, limit: number): Promise<CopilotExchange[]>;
  exportForUser(userId: string): Promise<(CopilotExchange & { feedback: string | null; createdAt: string })[]>;
  deleteForUser(userId: string): Promise<number>;
}

export function pgCopilotLogRepository(db: Database, cipherKey: string): CopilotLogRepository {
  const open = (row: { question: SealedValue; reply: SealedValue }): CopilotExchange => ({
    question: readField(row.question, cipherKey) ?? "",
    reply: readField(row.reply, cipherKey) ?? "",
  });
  const newest = [desc(copilotLogs.createdAt), desc(copilotLogs.id)];
  return {
    async insert(userId, vertical, exchange) {
      const id = newObjectId();
      await db.insert(copilotLogs).values({ id, userId, vertical, question: seal(exchange.question, cipherKey), reply: seal(exchange.reply, cipherKey) });
      return id;
    },
    async setFeedback(userId, logId, feedback, reason) {
      const result = await db
        .update(copilotLogs)
        .set({ feedback, ...(reason ? { reason } : {}) })
        .where(and(eq(copilotLogs.id, logId), eq(copilotLogs.userId, userId)));
      return (result.rowCount ?? 0) === 1;
    },
    async liked(userId, vertical, limit) {
      const rows = await db
        .select({ question: copilotLogs.question, reply: copilotLogs.reply })
        .from(copilotLogs)
        .where(and(eq(copilotLogs.userId, userId), eq(copilotLogs.vertical, vertical), eq(copilotLogs.feedback, "up")))
        .orderBy(...newest)
        .limit(limit);
      return rows.map(open);
    },
    async exportForUser(userId) {
      const rows = await db.select().from(copilotLogs).where(eq(copilotLogs.userId, userId)).orderBy(...newest);
      return rows.map((row) => ({ ...open(row), feedback: row.feedback, createdAt: row.createdAt.toISOString() }));
    },
    async deleteForUser(userId) {
      return (await db.delete(copilotLogs).where(eq(copilotLogs.userId, userId))).rowCount ?? 0;
    },
  };
}
