import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { AbrechnungCategory } from "@/lib/abrechnung/abrechnungTypes";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const url = new URL(req.url);
    const category = (url.searchParams.get("category") as AbrechnungCategory) || "vodafone";
    const items = await AbrechnungDatabaseService.listReklamationen(user.id, category);
    return ok(items);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/abrechnung/reklamationen/all]", error);
    return err("Internal server error");
  }
}
