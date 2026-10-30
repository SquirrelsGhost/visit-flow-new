import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { AbrechnungCategory } from "@/lib/abrechnung/abrechnungTypes";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; year: string }> },
): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const { id, year } = await context.params;
    const url = new URL(req.url);
    const category = (url.searchParams.get("category") as AbrechnungCategory) || "vodafone";
    const record = await AbrechnungDatabaseService.getMonth(
      user.id,
      category,
      Number(id) || 0,
      Number(year) || new Date().getFullYear(),
    );
    return ok(record);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/abrechnung/[id]/[year]]", error);
    return err("Internal server error");
  }
}
