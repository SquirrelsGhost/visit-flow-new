import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as { emails?: unknown };
    const emails = Array.isArray(body.emails) ? body.emails.filter((e): e is string => typeof e === "string") : [];
    const data = await TeamOrgDatabaseService.updatePartnerEmails(user.teamId ?? "team-alpha", emails);
    return ok(data);
  } catch (error) {
    console.error("[POST /api/teams/my-team/licenses/update-referred]", error);
    return err("Internal server error");
  }
}
