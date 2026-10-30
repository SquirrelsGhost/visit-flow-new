import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:*")) return err("Keine Berechtigung.", 403);
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") ?? undefined;
    const endDate = url.searchParams.get("endDate") ?? undefined;
    const activity = await TeamOrgDatabaseService.getAdminActivity(startDate, endDate);
    return ok({ doors: activity.doors });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/admin/doors]", error);
    return err("Internal server error");
  }
}
