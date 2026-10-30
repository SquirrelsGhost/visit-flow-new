import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

interface TeamMemberPatchResponse {
  user: NonNullable<Awaited<ReturnType<typeof TeamOrgDatabaseService.patchMember>>>;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) {
      return err("Nicht authentifiziert.", 401);
    }
    if (!hasPermission(user.permissions, "team:manage")) {
      return err("Keine Berechtigung (team:manage).", 403);
    }

    const { id } = await context.params;
    const patch = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!patch || typeof patch !== "object") {
      return err("Ungültiger JSON-Body.", 400);
    }
    if (patch.role === "admin" && !hasPermission(user.permissions, "admin:users")) {
      return err("Keine Berechtigung zur Vergabe der Admin-Rolle.", 403);
    }

    const updated = await TeamOrgDatabaseService.patchMember(id, patch);
    if (!updated) return err("Mitglied nicht gefunden", 404);
    return ok<TeamMemberPatchResponse>({ user: updated });
  } catch (error) {
    console.error("[PATCH /api/auth/team-members/[id]]", error);
    return err("Internal server error");
  }
}
