import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { SecurityDashboardDatabaseService } from "@/services/SecurityDashboardDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function POST(
  req: Request,
  context: { params: Promise<{ ip: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:*")) return err("Keine Berechtigung.", 403);
    const { ip } = await context.params;
    return ok(await SecurityDashboardDatabaseService.unblockIp(decodeURIComponent(ip)));
  } catch (error) {
    console.error("[POST /api/admin/unblock-ip/[ip]]", error);
    return err("Internal server error");
  }
}
