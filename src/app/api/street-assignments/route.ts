import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as {
      userId?: unknown;
      street?: unknown;
      zipCode?: unknown;
      city?: unknown;
    };
    const userId = String(body.userId ?? "");
    const street = String(body.street ?? "");
    const zipCode = String(body.zipCode ?? "");
    const city = String(body.city ?? "");
    if (!userId || !street) return err("userId und street erforderlich", 400);
    const res = await DoorsAndCrmDatabaseService.assignStreet(userId, street, zipCode, city);
    return ok(res);
  } catch (error) {
    console.error("[POST /api/street-assignments]", error);
    return err("Internal server error");
  }
}
