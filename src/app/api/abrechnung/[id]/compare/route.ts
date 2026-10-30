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
    const updated = await AbrechnungDatabaseService.patchItems(id, [], (i) => i);
    return ok({ compared: true, record: updated });
  } catch (error) {
    console.error("[POST /api/abrechnung/[id]/compare]", error);
    return err("Internal server error");
  }
}
