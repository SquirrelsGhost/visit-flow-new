import { Schema, model, type Model } from "mongoose";
import { COACH_MEMORY_KINDS, type CoachMemoryKind } from "@visit-flow/shared/copilotSchema";
import type { SealedValue } from "../../lib/crypto/dataCipher";

/**
 * Langzeit-Gedächtnis von Enes je Berater (v1 EnesMemory, hier ohne Embeddings). Eigene Collection
 * `coachmemories`; der Inhalt ist mit seal() verschlüsselt, MongoDB löscht abgelaufene Einträge selbst.
 */
export interface CoachMemoryDoc {
  userId: string;
  kind: CoachMemoryKind;
  content: SealedValue;
  /** "user" = ausdrücklich gesagt ("merk dir …"), "enes" = von Enes aus dem Gespräch gelernt. */
  source: "user" | "enes";
  createdAt: Date;
  expiresAt: Date;
}

const sealedShape = { sealed: Number, iv: String, tag: String, data: String };

const coachMemorySchema = new Schema<CoachMemoryDoc>(
  {
    userId: { type: String, required: true, index: true },
    kind: { type: String, enum: COACH_MEMORY_KINDS, required: true },
    content: { type: sealedShape, required: true, _id: false },
    source: { type: String, enum: ["user", "enes"], required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
    expiresAt: { type: Date, required: true },
  },
  { collection: "coachmemories", versionKey: false },
);

coachMemorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function coachMemoryModel(): Model<CoachMemoryDoc> {
  return model<CoachMemoryDoc>("CoachMemory", coachMemorySchema);
}
