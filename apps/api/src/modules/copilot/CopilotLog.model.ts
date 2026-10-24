import { Schema, model, type Model } from "mongoose";
import type { SealedValue } from "../../lib/crypto/dataCipher";

/**
 * Ein Austausch mit Enes, damit 👍/👎 einer Antwort zugeordnet werden kann (v1 AiChatLog).
 * Frage und Antwort sind verschlüsselt; 👍-Antworten dienen Enes als Beispiele, was bei diesem
 * Berater wirkt. Eigene Collection `copilotlogs` mit TTL.
 */
export interface CopilotLogDoc {
  userId: string;
  vertical: string;
  question: SealedValue;
  reply: SealedValue;
  feedback: "up" | "down" | null;
  reason?: string;
  createdAt: Date;
}

const DAY_SECONDS = 24 * 60 * 60;
const sealedShape = { sealed: Number, iv: String, tag: String, data: String };

const copilotLogSchema = new Schema<CopilotLogDoc>(
  {
    userId: { type: String, required: true, index: true },
    vertical: { type: String, required: true },
    question: { type: sealedShape, required: true, _id: false },
    reply: { type: sealedShape, required: true, _id: false },
    feedback: { type: String, enum: ["up", "down", null], default: null },
    reason: { type: String, maxlength: 500 },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "copilotlogs", versionKey: false },
);

export function copilotLogModel(retentionDays: number): Model<CopilotLogDoc> {
  copilotLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: retentionDays * DAY_SECONDS });
  return model<CopilotLogDoc>("CopilotLog", copilotLogSchema);
}
