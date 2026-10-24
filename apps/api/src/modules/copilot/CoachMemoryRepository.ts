import type { Model } from "mongoose";
import type { CoachMemoryKind, CoachMemoryView } from "@visit-flow/shared/copilotSchema";
import { readField, seal } from "../../lib/crypto/dataCipher";
import type { CoachMemoryDoc } from "./CoachMemory.model";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Gedächtnis von Enes. Der Service sieht nur Klartext; ver- und entschlüsselt wird hier. */
export interface CoachMemoryRepository {
  add(userId: string, kind: CoachMemoryKind, content: string, source: "user" | "enes"): Promise<CoachMemoryView>;
  /** Neueste zuerst. */
  list(userId: string, limit: number): Promise<CoachMemoryView[]>;
  remove(userId: string, id: string): Promise<boolean>;
  removeAll(userId: string): Promise<number>;
}

type StoredMemory = CoachMemoryDoc & { _id: { toString(): string } };

export function mongoCoachMemoryRepository(model: Model<CoachMemoryDoc>, cipherKey: string, retentionDays: number): CoachMemoryRepository {
  const view = (doc: StoredMemory): CoachMemoryView => ({
    id: doc._id.toString(),
    kind: doc.kind,
    content: readField(doc.content, cipherKey) ?? "",
    source: doc.source,
    createdAt: doc.createdAt.toISOString(),
  });
  return {
    async add(userId, kind, content, source) {
      const now = new Date();
      const created = await model.create({ userId, kind, source, content: seal(content, cipherKey), createdAt: now, expiresAt: new Date(now.getTime() + retentionDays * DAY_MS) });
      return view(created.toObject() as StoredMemory);
    },
    async list(userId, limit) {
      const docs = await model.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean<StoredMemory[]>().exec();
      return docs.map(view);
    },
    async remove(userId, id) {
      const result = await model.deleteOne({ _id: id, userId }).exec();
      return result.deletedCount === 1;
    },
    async removeAll(userId) {
      const result = await model.deleteMany({ userId }).exec();
      return result.deletedCount;
    },
  };
}
