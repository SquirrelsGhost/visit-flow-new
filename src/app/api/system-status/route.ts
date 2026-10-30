import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { env } from "@/lib/env";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";

interface SystemStatusResponse {
  bypassCompanyEmailRequirement: boolean;
  storageDriver: string;
  encrypted: boolean;
}

export async function GET(req: Request): Promise<Response> {
  try {
    void req.headers.get("user-agent");
    const settings = await TeamOrgDatabaseService.getSystemSettings();
    return ok<SystemStatusResponse>({
      bypassCompanyEmailRequirement: settings.bypassCompanyEmailRequirement,
      storageDriver: env.dataStoreDriver,
      encrypted: Boolean(env.dataKey),
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/system-status]", error);
    return err("Internal server error");
  }
}
