import { newObjectId } from "../../lib/db/objectId";
import type { CoachMemoryView } from "@visit-flow/shared/copilotSchema";
import type { CoachMemoryRepository } from "../../modules/copilot/CoachMemoryRepository";
import type { CopilotExchange, CopilotLogRepository } from "../../modules/copilot/CopilotLogRepository";
import type { LlmClient, LlmMessage, LlmStreamOptions, LlmToolCall } from "../../modules/copilot/llm/LlmClient";

/** Streamt feste Stücke (Text oder Werkzeug-Aufruf) und merkt sich, was ans Modell ging. */
export function fakeLlm(chunks: (string | LlmToolCall)[]): LlmClient & { calls: LlmMessage[][]; options: LlmStreamOptions[] } {
  const calls: LlmMessage[][] = [];
  const options: LlmStreamOptions[] = [];
  return {
    calls,
    options,
    async *stream(messages, opts = {}) {
      calls.push([...messages]);
      options.push(opts);
      for (const chunk of chunks) yield typeof chunk === "string" ? { type: "text", text: chunk } : { type: "tool", call: chunk };
    },
  };
}

export function memoryCoachMemories(): CoachMemoryRepository & { rows: (CoachMemoryView & { userId: string })[] } {
  const rows: (CoachMemoryView & { userId: string })[] = [];
  return {
    rows,
    async add(userId, kind, content, source) {
      const row = { id: newObjectId(), userId, kind, content, source, createdAt: new Date().toISOString() };
      rows.unshift(row);
      return { id: row.id, kind, content, source, createdAt: row.createdAt };
    },
    list: async (userId, limit) => rows.filter((r) => r.userId === userId).slice(0, limit).map(({ id, kind, content, source, createdAt }) => ({ id, kind, content, source, createdAt })),
    async remove(userId, id) {
      const index = rows.findIndex((r) => r.userId === userId && r.id === id);
      if (index >= 0) rows.splice(index, 1);
      return index >= 0;
    },
    async removeAll(userId) {
      const before = rows.length;
      rows.splice(0, rows.length, ...rows.filter((r) => r.userId !== userId));
      return before - rows.length;
    },
  };
}

interface LogRow extends CopilotExchange {
  id: string;
  userId: string;
  vertical: string;
  feedback: "up" | "down" | null;
}

export function memoryCopilotLogs(): CopilotLogRepository & { rows: LogRow[] } {
  const rows: LogRow[] = [];
  return {
    rows,
    async insert(userId, vertical, exchange) {
      const id = newObjectId();
      rows.push({ id, userId, vertical, feedback: null, ...exchange });
      return id;
    },
    async setFeedback(userId, logId, feedback) {
      const row = rows.find((r) => r.id === logId && r.userId === userId);
      if (row) row.feedback = feedback;
      return Boolean(row);
    },
    liked: async (userId, vertical, limit) => rows.filter((r) => r.userId === userId && r.vertical === vertical && r.feedback === "up").slice(0, limit),
    exportForUser: async (userId) => rows.filter((r) => r.userId === userId).map((r) => ({ question: r.question, reply: r.reply, feedback: r.feedback, createdAt: "" })),
    async deleteForUser(userId) {
      const before = rows.length;
      rows.splice(0, rows.length, ...rows.filter((r) => r.userId !== userId));
      return before - rows.length;
    },
  };
}
