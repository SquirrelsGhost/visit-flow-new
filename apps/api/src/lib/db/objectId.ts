import { randomBytes } from "node:crypto";

/**
 * Neue IDs im selben Format wie die ObjectIds aus v1 (24 Hex-Zeichen, vorne die Sekunden seit 1970).
 * So bleiben übernommene v1-IDs und neue v2-IDs gleich aufgebaut, zeitlich sortierbar, und
 * Access-Tokens, Cookies und Verweise aus v1 gelten nach dem Umzug unverändert weiter.
 */
export function newObjectId(now = new Date()): string {
  const seconds = Math.floor(now.getTime() / 1000).toString(16).padStart(8, "0");
  return seconds + randomBytes(8).toString("hex");
}

export const isObjectIdString = (value: string) => /^[0-9a-f]{24}$/.test(value);
