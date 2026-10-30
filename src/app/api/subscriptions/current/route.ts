import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    return ok(TeamOrgDatabaseService.getSubscription());
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/subscriptions/current]", error);
    return err("Internal server error");
  }
}
