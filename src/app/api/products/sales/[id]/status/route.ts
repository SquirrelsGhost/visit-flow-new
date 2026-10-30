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
    const body = (await req.json().catch(() => ({}))) as { status?: unknown };
    const status = typeof body.status === "string" ? body.status : "completed";
    const updated = await DoorsAndCrmDatabaseService.setSaleStatus(id, status);
    if (!updated) return err("Auftrag nicht gefunden", 404);
    return ok(updated);
  } catch (error) {
    console.error("[PATCH /api/products/sales/[id]/status]", error);
    return err("Internal server error");
  }
}
