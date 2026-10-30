import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const data = await TeamOrgDatabaseService.getTeamLicenses(user.teamId ?? "team-alpha");
    return ok(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/teams/my-team/licenses]", error);
    return err("Internal server error");
  }
}
