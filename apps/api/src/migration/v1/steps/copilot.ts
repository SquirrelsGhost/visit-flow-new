import type { CoachMemoryKind } from "@visit-flow/shared/copilotSchema";
import { seal } from "../../../lib/crypto/dataCipher";
import { DAY_MS } from "../../../lib/db/retention";
import { coachMemories } from "../../../modules/copilot/CoachMemory.model";
import { copilotLogs } from "../../../modules/copilot/CopilotLog.model";
import type { StepContext } from "../context";
import { idOf, inBatches, objectIdDate, toDate, toText } from "../convert";

export interface CopilotMigration {
  /** Derselbe DATA_CIPHER_KEY wie in der v2-API, sonst kann Enes die Inhalte nicht lesen. */
  cipherKey: string;
  /** COPILOT_MEMORY_DAYS: Frist ab dem Zeitstempel aus v1. */
  memoryDays: number;
}

/** v1 kennt zusätzlich "context" (Lage im Gespräch); in v2 ist das ein Fakt. */
const KINDS: Record<string, CoachMemoryKind> = { fact: "fact", preference: "preference", win: "win", weakspot: "weakspot", context: "fact" };

/**
 * Schritt 8: Gedächtnis von Enes (v1 `enesmemories`). Klartext aus v1 wird verschlüsselt, Embeddings
 * fallen weg (v2 sucht nicht semantisch). Abgelaufenes kommt nicht mit, die Frist zählt ab v1.
 */
export async function migrateCoachMemories(ctx: StepContext, options: CopilotMigration): Promise<void> {
  for await (const batch of inBatches(ctx.source.read("enesmemories"))) {
    const rows: (typeof coachMemories.$inferInsert)[] = [];
    for (const doc of batch) {
      const v1Id = idOf(doc._id);
      const content = toText(doc.content)?.trim().slice(0, 1000);
      if (!v1Id || !content) continue;
      const userId = ctx.ids.get("users", idOf(doc.userId));
      if (!userId) {
        ctx.report.warn("Erinnerung ohne bekannten Nutzer übersprungen", v1Id);
        continue;
      }
      const createdAt = toDate(doc.createdAt) ?? objectIdDate(v1Id) ?? ctx.now;
      const expiresAt = new Date(createdAt.getTime() + options.memoryDays * DAY_MS);
      if (expiresAt <= ctx.now) {
        ctx.report.warn("Erinnerung abgelaufen, nicht übernommen", v1Id);
        continue;
      }
      const kind = KINDS[toText(doc.type) ?? "fact"] ?? "fact";
      const source = doc.source === "user" ? "user" : "enes";
      rows.push({ id: ctx.ids.assign("enesmemories", v1Id, createdAt), userId, kind, source, content: seal(content, options.cipherKey), createdAt, expiresAt });
    }
    if (rows.length) await ctx.tx.insert(coachMemories).values(rows);
    ctx.report.count("coach_memories", rows.length);
  }
}

/**
 * Schritt 9: Gespräche mit 👍/👎 (v1 `ai_chat_logs`, dort ohnehin nur 30 Tage). Daraus lernt Enes,
 * welche Antworten bei diesem Berater gewirkt haben. Gespräche ohne Bewertung bringen nichts und bleiben weg.
 */
export async function migrateCopilotLogs(ctx: StepContext, options: CopilotMigration): Promise<void> {
  for await (const batch of inBatches(ctx.source.read("ai_chat_logs", { feedback: { $in: ["up", "down"] } }))) {
    const rows: (typeof copilotLogs.$inferInsert)[] = [];
    for (const doc of batch) {
      const v1Id = idOf(doc._id);
      const question = toText(doc.userMessage);
      const reply = toText(doc.aiResponse);
      const feedback = doc.feedback === "up" || doc.feedback === "down" ? doc.feedback : null;
      if (!v1Id || !question || !reply || !feedback) continue;
      const userId = ctx.ids.get("users", idOf(doc.userId));
      if (!userId) {
        ctx.report.warn("Gespräch ohne bekannten Nutzer übersprungen", v1Id);
        continue;
      }
      const createdAt = toDate(doc.createdAt) ?? objectIdDate(v1Id) ?? ctx.now;
      const reason = toText(doc.feedback_reason)?.slice(0, 500) ?? null;
      rows.push({
        id: ctx.ids.assign("ai_chat_logs", v1Id, createdAt),
        userId,
        // v1 kannte nur Telekommunikation
        vertical: "telco",
        question: seal(question, options.cipherKey),
        reply: seal(reply, options.cipherKey),
        feedback,
        reason,
        createdAt,
      });
    }
    if (rows.length) await ctx.tx.insert(copilotLogs).values(rows);
    ctx.report.count("copilot_logs", rows.length);
  }
}
