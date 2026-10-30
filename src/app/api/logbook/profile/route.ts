import { ok, err } from "@/lib/api";
import { LogbookDatabaseService } from "@/services/LogbookDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { logbookProfileInputSchema } from "@/shared/logbook/logbookSchema";

export async function PUT(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const raw = await req.json().catch(() => ({}));
    const parsed = logbookProfileInputSchema.safeParse(raw);
    if (!parsed.success) return err("Ungültige Fahrzeugprofil-Daten", 400);
    const res = await LogbookDatabaseService.putProfile(user.id, parsed.data);
    if (!res.ok) {
      return err(res.error, res.status);
    }
    return ok(res.data);
  } catch (error) {
    console.error("[PUT /api/logbook/profile]", error);
    return err("Internal server error");
  }
}
