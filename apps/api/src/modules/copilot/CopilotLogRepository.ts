import type { Model } from "mongoose";
import { readField, seal } from "../../lib/crypto/dataCipher";
import type { CopilotLogDoc } from "./CopilotLog.model";

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

type StoredLog = CopilotLogDoc & { _id: { toString(): string } };

export function mongoCopilotLogRepository(model: Model<CopilotLogDoc>, cipherKey: string): CopilotLogRepository {
  const open = (doc: StoredLog): CopilotExchange => ({
    question: readField(doc.question, cipherKey) ?? "",
    reply: readField(doc.reply, cipherKey) ?? "",
  });
  return {
    async insert(userId, vertical, exchange) {
      const created = await model.create({ userId, vertical, question: seal(exchange.question, cipherKey), reply: seal(exchange.reply, cipherKey), feedback: null });
      return created._id.toString();
    },
    async setFeedback(userId, logId, feedback, reason) {
      const result = await model.updateOne({ _id: logId, userId }, { $set: { feedback, ...(reason ? { reason } : {}) } }).exec();
      return result.matchedCount === 1;
    },
    async liked(userId, vertical, limit) {
      const docs = await model.find({ userId, vertical, feedback: "up" }).sort({ createdAt: -1 }).limit(limit).lean<StoredLog[]>().exec();
      return docs.map(open);
    },
    async exportForUser(userId) {
      const docs = await model.find({ userId }).sort({ createdAt: -1 }).lean<StoredLog[]>().exec();
      return docs.map((doc) => ({ ...open(doc), feedback: doc.feedback, createdAt: doc.createdAt.toISOString() }));
    },
    async deleteForUser(userId) {
      const result = await model.deleteMany({ userId }).exec();
      return result.deletedCount;
    },
  };
}
