import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

interface AdminUsersResponse {
  users: Awaited<ReturnType<typeof TeamOrgDatabaseService.listUsers>>;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:*")) return err("Keine Berechtigung.", 403);
    const users = await TeamOrgDatabaseService.listUsers();
    return ok<AdminUsersResponse>({ users });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/admin/users]", error);
    return err("Internal server error");
  }
}
