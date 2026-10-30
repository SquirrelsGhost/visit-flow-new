import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { EmailReport } from "@/lib/settings/userSettings";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TariffAndCopilotDatabaseService } from "@/services/TariffAndCopilotDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const settings = await TariffAndCopilotDatabaseService.getEmailReport(user.id);
    return ok({ settings });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/settings/email-notifications]", error);
    return err("Internal server error");
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as Partial<EmailReport>;
    const settings = await TariffAndCopilotDatabaseService.saveEmailReport(user.id, {
      enabled: Boolean(body.enabled),
      time: typeof body.time === "string" && body.time ? body.time : "19:00",
    });
    return ok({ settings });
  } catch (error) {
    console.error("[POST /api/settings/email-notifications]", error);
    return err("Internal server error");
  }
}
