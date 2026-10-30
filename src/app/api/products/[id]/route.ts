import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id } = await context.params;
    const res = await DoorsAndCrmDatabaseService.deleteSale(id);
    return ok(res);
  } catch (error) {
    console.error("[DELETE /api/products/[id]]", error);
    return err("Internal server error");
  }
}
