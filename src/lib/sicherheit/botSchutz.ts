import { createHash } from "node:crypto";

const POW_PREFIX = "000"; // 12 Bit Arbeit (~4096 SHA-256 Hashes im Browser ≈ 10ms)
const MAX_ALTER_MS = 10 * 60 * 1000;

export interface BotSchutzFelder {
  honeypot?: unknown;
  powTs?: unknown;
  powNonce?: unknown;
}

/**
 * Verpflichtender Schutz vor Botnetzen und Credential-Stuffing vor jedem scrypt/Argon2id-Aufruf:
 * 1. Unsichtbares Honeypot-Feld muss leer sein.
 * 2. Zeitstempel (powTs) und Nonce (powNonce) müssen vorhanden sein, dürfen höchstens
 *    10 Minuten alt sein und SHA-256("ec-pow-v1:ts:nonce") muss mit "000" beginnen.
 * Liest wahlweise aus dem JSON-Body oder den Request-Headern (`x-pow-ts`, `x-pow-nonce`, `x-honeypot`).
 */
export function pruefeLoginBotSchutz(
  body: BotSchutzFelder,
  headers?: Headers,
): { ok: true } | { ok: false; grund: string } {
  const honeypotRaw = body.honeypot ?? headers?.get("x-honeypot");
  if (typeof honeypotRaw === "string" && honeypotRaw.trim() !== "") {
    return { ok: false, grund: "Anfrage durch Bot-Filter abgewiesen." };
  }

  const rawTs = body.powTs ?? headers?.get("x-pow-ts") ?? undefined;
  const rawNonce = body.powNonce ?? headers?.get("x-pow-nonce") ?? undefined;
  const ts = typeof rawTs === "number" ? rawTs : Number(rawTs);
  const nonce = typeof rawNonce === "number" ? rawNonce : Number(rawNonce);

  if (rawTs === undefined || rawNonce === undefined || !Number.isFinite(ts) || !Number.isFinite(nonce)) {
    return {
      ok: false,
      grund: "Sicherheitsnachweis (Proof-of-Work) fehlt. Bitte nutze das Anmeldeformular im Browser.",
    };
  }

  const alter = Date.now() - ts;
  if (alter < -60_000 || alter > MAX_ALTER_MS) {
    return { ok: false, grund: "Sicherheits-Zeitstempel abgelaufen. Bitte versuche es erneut." };
  }

  const digest = createHash("sha256").update(`ec-pow-v1:${ts}:${nonce}`, "utf8").digest("hex");
  if (!digest.startsWith(POW_PREFIX)) {
    return { ok: false, grund: "Ungültige Proof-of-Work-Signatur." };
  }

  return { ok: true };
}
