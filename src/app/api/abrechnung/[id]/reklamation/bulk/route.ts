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
    const body = (await req.json().catch(() => ({}))) as {
      itemIds?: unknown;
      reason?: unknown;
      note?: unknown;
    };
    const ids = Array.isArray(body.itemIds) ? body.itemIds.filter((i): i is string => typeof i === "string") : [];
    const reason = typeof body.reason === "string" ? body.reason : "Nicht abgerechnet";
    const note = typeof body.note === "string" ? body.note : "";
    const now = new Date().toISOString();
    const updated = await AbrechnungDatabaseService.patchItems(id, ids, (item) => ({
      ...item,
      reklamiert: true,
      reklamationReason: reason,
      reklamationNote: note,
      reklamationDate: now,
      reklamationResolved: false,
    }));
    return ok({ record: updated });
  } catch (error) {
    console.error("[POST /api/abrechnung/[id]/reklamation/bulk]", error);
    return err("Internal server error");
  }
}
