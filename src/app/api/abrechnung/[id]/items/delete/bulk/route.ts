import { ok, err } from "@/lib/api";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const body = (await req.json().catch(() => ({}))) as { itemIds?: unknown };
    const ids = Array.isArray(body.itemIds) ? body.itemIds.filter((i): i is string => typeof i === "string") : [];
    const updated = await AbrechnungDatabaseService.patchItems(id, ids, () => null);
    return ok({ record: updated });
  } catch (error) {
    console.error("[POST /api/abrechnung/[id]/items/delete/bulk]", error);
    return err("Internal server error");
  }
}
