import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

interface TeamMembersResponse {
  users: Awaited<ReturnType<typeof TeamOrgDatabaseService.listUsers>>;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser || sessionUser.banned) {
      return err("Nicht authentifiziert.", 401);
    }
    const isAdmin = hasPermission(sessionUser.permissions, "admin:users");
    const canViewTeam = isAdmin || hasPermission(sessionUser.permissions, "team:view");
    if (!canViewTeam) {
      return err("Keine Berechtigung (team:view).", 403);
    }
    if (!isAdmin && !sessionUser.teamId) {
      return ok<TeamMembersResponse>({ users: [] });
    }
    const users = await TeamOrgDatabaseService.listUsers(isAdmin ? undefined : sessionUser.teamId);
    return ok<TeamMembersResponse>({ users });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/auth/team-members]", error);
    return err("Internal server error");
  }
}
