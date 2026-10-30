import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const list = await AbrechnungDatabaseService.listAll(
      hasPermission(user.permissions, "admin:*") ? undefined : user.id,
    );
    return ok(list);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/abrechnung]", error);
    return err("Internal server error");
  }
}
