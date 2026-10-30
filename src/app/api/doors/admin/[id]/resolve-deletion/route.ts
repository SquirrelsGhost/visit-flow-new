import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const body = (await req.json().catch(() => ({}))) as { action?: unknown };
    const action = body.action === "reject" ? "reject" : "approve";
    const resolved = await DoorsAndCrmDatabaseService.resolveDeletion(id, action);
    return ok({ resolved });
  } catch (error) {
    console.error("[PATCH /api/doors/admin/[id]/resolve-deletion]", error);
    return err("Internal server error");
  }
}
