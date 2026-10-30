import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const areas = await DoorsAndCrmDatabaseService.listAreas();
    return ok(areas);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/areas]", error);
    return err("Internal server error");
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const saved = await DoorsAndCrmDatabaseService.saveArea(undefined, body);
    return ok(saved, 201);
  } catch (error) {
    console.error("[POST /api/areas]", error);
    return err("Internal server error");
  }
}
