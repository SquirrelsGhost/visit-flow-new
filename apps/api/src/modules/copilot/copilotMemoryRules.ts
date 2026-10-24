/** "Merk dir …", "Vergiss nicht …", "Denk dran …" am Anfang einer Nachricht. */
const EXPLICIT = /^\s*(?:enes[,:]?\s+)?(?:bitte\s+)?(?:merk(?:e)?\s+dir|vergiss\s+nicht|denk\s+dran|notier\s+dir)\b[:,]?\s*(?:,\s*)?(?:dass\s+)?(.+)$/is;
const MIN_LENGTH = 3;
const MAX_LENGTH = 240;

/**
 * Ausdrücklicher Merk-Wunsch des Beraters. Wird sofort gespeichert, unabhängig vom Modell,
 * damit "merk dir, ich arbeite nur nachmittags" garantiert ankommt.
 */
export function explicitMemory(message: string): string | null {
  const match = EXPLICIT.exec(message);
  const content = match?.[1]?.trim().replace(/[.!]+$/, "");
  if (!content || content.length < MIN_LENGTH) return null;
  return content.slice(0, MAX_LENGTH);
}
