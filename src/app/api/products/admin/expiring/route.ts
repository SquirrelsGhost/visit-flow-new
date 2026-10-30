import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const contracts = await DoorsAndCrmDatabaseService.listExpiringContracts();
    return ok({ contracts });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/products/admin/expiring]", error);
    return err("Internal server error");
  }
}
