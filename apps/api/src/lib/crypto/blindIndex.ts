import { createHmac } from "node:crypto";

/** Länge des gespeicherten Index in Hex-Zeichen (128 Bit). Reicht gegen Kollisionen, verrät weniger als der volle Hash. */
const INDEX_HEX_LENGTH = 32;

/** Vereinheitlicht Eingaben, damit "Max@Mail.de " und "max@mail.de" denselben Index ergeben. */
export type Normalizer = (value: string) => string;

export const normalizeEmail: Normalizer = (value) => value.trim().toLowerCase();
/** Nur Ziffern, führendes +49 oder 0049 wird zu 0. */
export const normalizePhone: Normalizer = (value) => value.replace(/[^\d+]/g, "").replace(/^(\+|00)49/, "0").replace(/\D/g, "");

/**
 * Blind Index: deterministischer HMAC-SHA256 über den normalisierten Klartext, gekürzt.
 * Damit lassen sich verschlüsselte Felder suchen und auf Dubletten prüfen
 * (z. B. PortingLead.phoneIndex), ohne den Klartext zu speichern.
 * Der Schlüssel (BLIND_INDEX_KEY) muss ein anderer sein als der für die Verschlüsselung.
 */
export function blindIndex(value: string, secret: string, normalize: Normalizer = (v) => v.trim()): string {
  return createHmac("sha256", secret).update(normalize(value), "utf8").digest("hex").slice(0, INDEX_HEX_LENGTH);
}
