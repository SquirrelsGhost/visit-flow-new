import { randomBytes } from "node:crypto";

/**
 * Neue IDs als UUIDv7 (RFC 9562): vorne die Millisekunden seit 1970, dahinter Zufall. Zeitlich
 * sortiert, deshalb landen neue Zeilen am Ende des Index statt verstreut wie bei UUIDv4.
 * PostgreSQL bekommt erst ab Version 18 eine eigene uuidv7(), darum entsteht die ID im Code.
 */
export function newId(now = Date.now()): string {
  const bytes = randomBytes(16);
  bytes.writeUIntBE(now, 0, 6);
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f);
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f);
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** IDs aus Anfragen vorher prüfen: PostgreSQL bricht bei einer ungültigen UUID mit einem Fehler ab. */
export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);
