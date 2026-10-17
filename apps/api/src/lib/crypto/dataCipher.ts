import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Feldverschlüsselung at rest mit AES-256-GCM (übernommen aus Einhorn, src/lib/dataCipher.ts).
 * GCM verschlüsselt und erkennt gleichzeitig jede Veränderung am Geheimtext.
 * Jeder Aufruf nutzt einen neuen Zufalls-IV: derselbe Klartext ergibt jedes Mal einen anderen Wert.
 * Zum Suchen dient deshalb ein Blind Index (siehe blindIndex.ts), nie der Geheimtext selbst.
 */
export interface SealedValue {
  sealed: 1;
  iv: string;
  tag: string;
  data: string;
}

const IV_BYTES = 12;

function keyFrom(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function isSealed(value: unknown): value is SealedValue {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<SealedValue>;
  return candidate.sealed === 1 && typeof candidate.iv === "string" && typeof candidate.tag === "string" && typeof candidate.data === "string";
}

export function seal(plain: string, secret: string): SealedValue {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(secret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return { sealed: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") };
}

/** Wirft, wenn der Wert verändert wurde oder der Schlüssel falsch ist. */
export function unseal(value: SealedValue, secret: string): string {
  const decipher = createDecipheriv("aes-256-gcm", keyFrom(secret), Buffer.from(value.iv, "base64"));
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(value.data, "base64")), decipher.final()]).toString("utf8");
}

/**
 * Liest ein Feld, das noch Klartext aus v1 oder schon verschlüsselt sein kann.
 * So kann v2 im laufenden Betrieb auf verschlüsselte Felder umstellen, ohne Migrations-Stillstand.
 */
export function readField(value: unknown, secret: string): string | null {
  if (value === null || value === undefined) return null;
  if (isSealed(value)) return unseal(value, secret);
  return typeof value === "string" ? value : null;
}
