import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:*")) return err("Keine Berechtigung.", 403);
    const { id } = await context.params;
    const patch = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const updated = await TeamOrgDatabaseService.patchMember(id, patch);
    if (!updated) return err("Benutzer nicht gefunden", 404);
    return ok({ user: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]]", error);
    return err("Internal server error");
  }
}
