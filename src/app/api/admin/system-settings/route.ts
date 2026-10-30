import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { SystemFlags } from "@/lib/admin/adminTypes";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

interface SystemSettingsResponse {
  settings: SystemFlags;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:*")) return err("Keine Berechtigung.", 403);
    const settings = await TeamOrgDatabaseService.getSystemSettings();
    return ok<SystemSettingsResponse>({ settings });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/admin/system-settings]", error);
    return err("Internal server error");
  }
}

export async function PATCH(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    if (!hasPermission(user.permissions, "admin:*")) return err("Keine Berechtigung.", 403);
    const patch = (await req.json().catch(() => ({}))) as Partial<SystemFlags>;
    const settings = await TeamOrgDatabaseService.saveSystemSettings(patch);
    return ok<SystemSettingsResponse>({ settings });
  } catch (error) {
    console.error("[PATCH /api/admin/system-settings]", error);
    return err("Internal server error");
  }
}
