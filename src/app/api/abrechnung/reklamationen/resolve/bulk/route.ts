import { ok, err } from "@/lib/api";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as { itemIds?: unknown };
    const ids = Array.isArray(body.itemIds) ? body.itemIds.filter((i): i is string => typeof i === "string") : [];
    const updated = await AbrechnungDatabaseService.resolveReklamationenBulk(ids);
    return ok({ updated });
  } catch (error) {
    console.error("[POST /api/abrechnung/reklamationen/resolve/bulk]", error);
    return err("Internal server error");
  }
}
