import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { TariffAndCopilotDatabaseService } from "@/services/TariffAndCopilotDatabaseService";

export async function GET(req: Request): Promise<Response> {
  try {
    await getSessionUser(req);
    return ok(TariffAndCopilotDatabaseService.getGroupedSimulatorTariffs());
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/simulate/tariffs-grouped]", error);
    return err("Internal server error");
  }
}
