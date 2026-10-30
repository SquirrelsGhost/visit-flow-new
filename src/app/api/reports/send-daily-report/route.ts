import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    return ok({ sent: true });
  } catch (error) {
    console.error("[POST /api/reports/send-daily-report]", error);
    return err("Internal server error");
  }
}
