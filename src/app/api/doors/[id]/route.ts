import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const patch = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const updated = await DoorsAndCrmDatabaseService.updateDoor(id, patch);
    if (!updated) return err("Tür nicht gefunden", 404);
    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/doors/[id]]", error);
    return err("Internal server error");
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const res = await DoorsAndCrmDatabaseService.deleteDoor(id);
    return ok(res);
  } catch (error) {
    console.error("[DELETE /api/doors/[id]]", error);
    return err("Internal server error");
  }
}
