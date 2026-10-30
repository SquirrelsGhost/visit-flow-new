import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    return ok(TeamOrgDatabaseService.getInvoices());
  } catch (error) {
    console.error("[POST /api/invoices/sync]", error);
    return err("Internal server error");
  }
}
