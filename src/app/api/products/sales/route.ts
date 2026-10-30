import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const sales = await DoorsAndCrmDatabaseService.listSales(
      hasPermission(user.permissions, "admin:*") ? undefined : { userId: user.id },
    );
    return ok({ sales });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/products/sales]", error);
    return err("Internal server error");
  }
}
