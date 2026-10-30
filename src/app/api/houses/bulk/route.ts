import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as { houses?: Record<string, unknown>[] };
    const list = Array.isArray(body.houses) ? body.houses : [];
    const res = await DoorsAndCrmDatabaseService.upsertDoorsBulk(
      list,
      user.id,
      user.name,
      user.teamId,
      hasPermission(user.permissions, "admin:*"),
    );
    return ok(res);
  } catch (error) {
    console.error("[POST /api/houses/bulk]", error);
    return err("Internal server error");
  }
}
