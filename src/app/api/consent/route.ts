import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { ConsentDatabaseService, type DsgvoConsentRecord } from "@/services/ConsentDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

interface ConsentRecordResponse {
  id: string;
  receivedAt: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const user = await getSessionUser(req).catch(() => null);
    const saved = await ConsentDatabaseService.recordConsent(req, body, user?.id);
    return ok<ConsentRecordResponse>({ id: saved.id, receivedAt: saved.receivedAt }, 201);
  } catch (error) {
    console.error("[POST /api/consent]", error);
    return err("Internal server error");
  }
}

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) {
      return err("Nicht authentifiziert.", 401);
    }
    if (!hasPermission(user.permissions, "admin:security")) {
      return err("Keine Berechtigung (admin:security).", 403);
    }
    const list: DsgvoConsentRecord[] = await ConsentDatabaseService.listConsents();
    return ok<DsgvoConsentRecord[]>(list);
  } catch (error) {
    console.error("[GET /api/consent]", error);
    return err("Internal server error");
  }
}
