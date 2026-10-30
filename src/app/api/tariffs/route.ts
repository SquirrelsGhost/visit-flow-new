import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import type { TariffCategory } from "@/lib/tariff/tariffTypes";
import { TariffAndCopilotDatabaseService } from "@/services/TariffAndCopilotDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const category = (url.searchParams.get("category") as TariffCategory) || "strom";
    const tariffs = TariffAndCopilotDatabaseService.getTariffsByCategory(category);
    return ok(tariffs);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/tariffs]", error);
    return err("Internal server error");
  }
}
