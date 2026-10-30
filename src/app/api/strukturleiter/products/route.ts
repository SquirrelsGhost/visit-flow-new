import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { DoorsAndCrmDatabaseService } from "@/services/DoorsAndCrmDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") ?? undefined;
    const endDate = url.searchParams.get("endDate") ?? undefined;
    const products = await DoorsAndCrmDatabaseService.listSales({ startDate, endDate });
    return ok({ products });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/strukturleiter/products]", error);
    return err("Internal server error");
  }
}
