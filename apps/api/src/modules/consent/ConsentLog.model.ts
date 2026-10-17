import { Schema, model, type Model } from "mongoose";
import { CONSENT_CATEGORIES, CONSENT_SOURCES, type ConsentChoice, type ConsentSource } from "@visit-flow/shared/consent";

/**
 * Einwilligungs-Protokoll (Nachweis nach Art. 7 Abs. 1 DSGVO). Bewusst ohne IP, User-Agent und userId.
 * Eigene Collection `consentlogs`: Die v1-Collection `userconsents` (pro Nutzer, mit GPS-Widerspruch)
 * bleibt unverändert, solange v1 läuft.
 */
export interface ConsentLogDoc {
  consentId: string;
  version: number;
  choice: ConsentChoice;
  source: ConsentSource;
  receivedAt: Date;
}

const DAY_SECONDS = 24 * 60 * 60;

const choiceDefinition = Object.fromEntries(CONSENT_CATEGORIES.map((category) => [category, { type: Boolean, required: true }]));

const consentLogSchema = new Schema<ConsentLogDoc>(
  {
    consentId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    choice: choiceDefinition,
    source: { type: String, enum: CONSENT_SOURCES, required: true },
    receivedAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "consentlogs", versionKey: false },
);

/**
 * Erzeugt das Model mit TTL-Index: MongoDB löscht Einträge nach `retentionDays` selbst,
 * auch wenn der Endpunkt lange nicht aufgerufen wird. Eine spätere Änderung der Frist
 * braucht ein `collMod` auf den bestehenden Index.
 */
export function consentLogModel(retentionDays: number): Model<ConsentLogDoc> {
  consentLogSchema.index({ receivedAt: 1 }, { expireAfterSeconds: retentionDays * DAY_SECONDS });
  return model<ConsentLogDoc>("ConsentLog", consentLogSchema);
}
