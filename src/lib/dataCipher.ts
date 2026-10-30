import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** Verschlüsselte Hülle (AES-256-GCM) für Dateien, JSONB-Records und sensible SQL-Spalten (Art. 32 DSGVO). */
export interface SealedPayload {
  sealed: 1;
  iv: string;
  tag: string;
  data: string;
}

function keyFrom(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function isSealed(value: unknown): value is SealedPayload {
  return typeof value === "object" && value !== null && (value as SealedPayload).sealed === 1;
}

/** AES-256-GCM: verschlüsselt und schützt gleichzeitig vor unbemerkter Veränderung (Authenticated Encryption). */
export function seal(plain: string, secret: string): SealedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(secret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return {
    sealed: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
}

export function unseal(payload: SealedPayload, secret: string): string {
  const decipher = createDecipheriv("aes-256-gcm", keyFrom(secret), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(payload.data, "base64")), decipher.final()]).toString("utf8");
}

/**
 * Verschlüsselt ein beliebiges Objekt (z. B. Kundendaten, Tür-Notizen) für eine SQL-TEXT-Spalte.
 * Wenn kein `secret` gesetzt ist (lokale Entwicklung ohne Schlüssel), wird JSON-Klartext gespeichert.
 */
export function sealJson<T>(value: T, secret: string): string {
  const raw = JSON.stringify(value);
  return secret ? JSON.stringify(seal(raw, secret)) : raw;
}

/**
 * Entschlüsselt eine mit `sealJson` gespeicherte SQL-TEXT-Spalte transparent.
 */
export function unsealJson<T>(raw: string | null | undefined, secret: string, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isSealed(parsed)) {
      if (!secret) return fallback;
      return JSON.parse(unseal(parsed, secret)) as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}
