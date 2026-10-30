import { ok, err } from "@/lib/api";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const deleted = await AbrechnungDatabaseService.deleteById(id);
    return ok({ deleted });
  } catch (error) {
    console.error("[DELETE /api/abrechnung/[id]]", error);
    return err("Internal server error");
  }
}
