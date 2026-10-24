/** Kleine, verlustarme Umwandlungen von v1-Werten (ObjectId, Datum als String, fehlende Felder). */

interface ObjectIdLike {
  toHexString(): string;
}

const isObjectId = (value: unknown): value is ObjectIdLike =>
  typeof value === "object" && value !== null && typeof (value as ObjectIdLike).toHexString === "function";

/** ObjectId oder String als Text-ID, sonst null. */
export function idOf(value: unknown): string | null {
  if (isObjectId(value)) return value.toHexString();
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/** Erstellungszeit aus einer ObjectId (die ersten 4 Bytes sind Sekunden seit 1970). */
export function objectIdDate(id: string): Date | null {
  return /^[0-9a-f]{24}$/.test(id) ? new Date(parseInt(id.slice(0, 8), 16) * 1000) : null;
}

export const toText = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null);

/** Für jsonb: Datum als ISO-String, ObjectId als Hex, Rest unverändert. */
export function toJson(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (isObjectId(value)) return value.toHexString();
  if (Array.isArray(value)) return value.map(toJson);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, toJson(inner)]));
  return value;
}

export async function* inBatches<T>(items: AsyncIterable<T>, size = 500): AsyncGenerator<T[]> {
  let batch: T[] = [];
  for await (const item of items) {
    batch.push(item);
    if (batch.length >= size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}

export function chunk<T>(items: T[], size = 500): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}
