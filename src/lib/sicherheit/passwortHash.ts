import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
const KEY_LEN = 64;

function pepperedPassword(klartext: string): Buffer {
  return createHmac("sha256", env.authPepper || "vf-pycie-pepper-v1").update(klartext, "utf8").digest();
}

/**
 * Erzeugt einen kryptographischen Passwort-Hash (`scrypt` + HMAC-Pepper + 16 Byte Salt).
 * Format: `scrypt$v1$<saltBase64Url>$<hashBase64Url>`
 */
export function hashePasswort(klartext: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(pepperedPassword(klartext), salt, KEY_LEN, SCRYPT_PARAMS);
  return `scrypt$v1$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

/**
 * Prüft ein Klartext-Passwort zeitkonstant (`timingSafeEqual`) gegen einen gespeicherten Hash.
 */
export function pruefePasswort(klartext: string, gespeichert: string | undefined | null): boolean {
  if (!gespeichert) return false;
  const teile = gespeichert.split("$");
  if (teile.length !== 4 || teile[0] !== "scrypt" || teile[1] !== "v1") return false;
  try {
    const salt = Buffer.from(teile[2], "base64url");
    const erwartet = Buffer.from(teile[3], "base64url");
    const berechnet = scryptSync(pepperedPassword(klartext), salt, erwartet.length, SCRYPT_PARAMS);
    return erwartet.length === berechnet.length && timingSafeEqual(erwartet, berechnet);
  } catch {
    return false;
  }
}
