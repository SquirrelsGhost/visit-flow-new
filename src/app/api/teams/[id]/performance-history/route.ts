import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { Vertical } from "@/lib/battle/battleCategories";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const url = new URL(req.url);
    const period = Math.min(90, Math.max(7, Number(url.searchParams.get("period")) || 14));
    const vertical = (url.searchParams.get("vertical") as Vertical) || "telco";
    const history = await TeamOrgDatabaseService.getPerformanceHistory(period, vertical);
    return ok(history);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/teams/[id]/performance-history]", error);
    return err("Internal server error");
  }
}
