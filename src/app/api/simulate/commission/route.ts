import { ok, err } from "@/lib/api";
import { TariffAndCopilotDatabaseService } from "@/services/TariffAndCopilotDatabaseService";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      products?: { category?: string; type?: string; quantity?: number }[];
    };
    const products = Array.isArray(body.products) ? body.products : [];
    return ok(TariffAndCopilotDatabaseService.refineCommissions(products));
  } catch (error) {
    console.error("[POST /api/simulate/commission]", error);
    return err("Internal server error");
  }
}
