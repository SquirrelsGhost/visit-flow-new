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
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const saved = await DoorsAndCrmDatabaseService.saveArea(id, body);
    return ok(saved);
  } catch (error) {
    console.error("[PUT /api/areas/[id]]", error);
    return err("Internal server error");
  }
}
