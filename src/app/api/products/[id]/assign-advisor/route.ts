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
    const body = (await req.json().catch(() => ({}))) as { advisorId?: unknown };
    const advisorId = typeof body.advisorId === "string" ? body.advisorId : null;
    const updated = await DoorsAndCrmDatabaseService.assignExpiringAdvisor(id, advisorId);
    if (!updated) return err("Vertrag nicht gefunden", 404);
    return ok(updated);
  } catch (error) {
    console.error("[PATCH /api/products/[id]/assign-advisor]", error);
    return err("Internal server error");
  }
}
