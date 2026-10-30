import { ok, err } from "@/lib/api";
import { LogbookDatabaseService } from "@/services/LogbookDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { logbookMonthInputSchema } from "@/shared/logbook/logbookSchema";

export async function PUT(
  req: Request,
  context: { params: Promise<{ month: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { month } = await context.params;
    const raw = await req.json().catch(() => ({}));
    const parsed = logbookMonthInputSchema.safeParse(raw);
    if (!parsed.success) return err("Ungültige Fahrtenbuch-Monatsdaten", 400);
    const res = await LogbookDatabaseService.putMonth(user.id, month, parsed.data);
    if (!res.ok) {
      return err(res.error, res.status);
    }
    return ok(res.data);
  } catch (error) {
    console.error("[PUT /api/logbook/months/[month]]", error);
    return err("Internal server error");
  }
}
