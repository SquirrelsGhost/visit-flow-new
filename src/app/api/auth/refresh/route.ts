import { ok, err } from "@/lib/api";
import { readCookie, VF_SESSION_COOKIE } from "@/services/sicherheit/SessionToken";
import { ZeroTrustSessionService } from "@/services/sicherheit/ZeroTrustSessionService";
import type { RefreshResponse } from "@/shared/auth/authSchemas";

function extractTokenFromSetCookie(setCookie?: string): string | null {
  if (!setCookie) return null;
  const firstSegment = setCookie.split(";")[0] ?? "";
  const eqIndex = firstSegment.indexOf("=");
  if (eqIndex < 0) return null;
  const rawValue = firstSegment.slice(eqIndex + 1).trim();
  if (!rawValue) return null;
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const outcome = await ZeroTrustSessionService.inspectSession(req);
    if (!outcome.ok || !outcome.data.authenticated || !outcome.data.user) {
      const response = err("Sitzung abgelaufen oder ungültig", 401);
      if (outcome.setCookie) response.headers.set("set-cookie", outcome.setCookie);
      return response;
    }

    const rotatedToken = extractTokenFromSetCookie(outcome.setCookie);
    const existingCookie =
      readCookie(req, VF_SESSION_COOKIE) ??
      readCookie(req, "__Host-vf_session") ??
      readCookie(req, "vf_session");

    const token = rotatedToken ?? existingCookie;
    if (!token) {
      return err("Sitzung abgelaufen oder ungültig", 401);
    }

    const response = ok<RefreshResponse>({ token });
    if (outcome.setCookie) response.headers.set("set-cookie", outcome.setCookie);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/refresh]", error);
    return err("Internal server error");
  }
}
