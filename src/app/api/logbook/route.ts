import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { LogbookDatabaseService } from "@/services/LogbookDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const url = new URL(req.url);
    const since = url.searchParams.get("since");
    const view = await LogbookDatabaseService.getView(user.id, since);
    return ok(view);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/logbook]", error);
    return err("Internal server error");
  }
}
