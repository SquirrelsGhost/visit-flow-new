import { createHmac, timingSafeEqual } from "node:crypto";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Im `httpOnly`-Session-Cookie (`__Host-` Prefix in Produktion) stehen niemals Klartext-Permissions
 * (Schutz vor Stale-Permissions bei Sperre/Rollenentzug), sondern nur `{ id, version, sessionId, tokenId, exp }.HMAC_SHA256`.
 */
export const VF_SESSION_COOKIE = IS_PRODUCTION ? "__Host-vf_session" : "vf_session";
export const VF_DEMO_COOKIE = "vf_demo_session";
export const VF_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 Tage

const DEV_SECRET = "vf-dev-zero-trust-session-secret-do-not-use-in-prod-2026";

export interface SessionTokenDaten {
  id: string;
  version: number;
  sessionId: string;
  tokenId: string;
  exp?: number;
}

function getSecret(): string {
  const configured = process.env.VF_SESSION_SECRET ?? process.env.JWT_SECRET ?? "";
  if (configured.length >= 16) {
    return createHmac("sha256", configured).update("visit-flow-session-v2").digest("hex");
  }
  return DEV_SECRET;
}

const sign = (payload: string): string => createHmac("sha256", getSecret()).update(payload).digest("base64url");

export function createSessionToken(daten: SessionTokenDaten, ttlSeconds = VF_SESSION_SECONDS): string {
  const exp = daten.exp ?? Date.now() + ttlSeconds * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      id: daten.id,
      version: daten.version,
      sessionId: daten.sessionId,
      tokenId: daten.tokenId,
      exp,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined | null, nowMs = Date.now()): SessionTokenDaten | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      id?: unknown;
      version?: unknown;
      sessionId?: unknown;
      tokenId?: unknown;
      exp?: unknown;
    };
    if (
      typeof data.id !== "string" ||
      !data.id ||
      typeof data.version !== "number" ||
      typeof data.sessionId !== "string" ||
      !data.sessionId ||
      typeof data.tokenId !== "string" ||
      !data.tokenId ||
      typeof data.exp !== "number" ||
      data.exp <= nowMs
    ) {
      return null;
    }
    return {
      id: data.id,
      version: data.version,
      sessionId: data.sessionId,
      tokenId: data.tokenId,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

export function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

export function buildSetSessionCookieHeader(token: string, maxAgeSeconds = VF_SESSION_SECONDS): string {
  const parts = [
    `${VF_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (IS_PRODUCTION) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookieHeader(): string {
  const parts = [`${VF_SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (IS_PRODUCTION) parts.push("Secure");
  return parts.join("; ");
}
