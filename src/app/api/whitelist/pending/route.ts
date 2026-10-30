import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import type { WhitelistEntry } from "@/lib/security/securityTypes";
import { SecurityDashboardDatabaseService } from "@/services/SecurityDashboardDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

interface PendingWhitelistEntry extends WhitelistEntry {
  status?: string;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) {
      return err("Nicht authentifiziert.", 401);
    }
    if (!hasPermission(user.permissions, "admin:security")) {
      return err("Keine Berechtigung (admin:security).", 403);
    }
    const { whitelist } = await SecurityDashboardDatabaseService.getWhitelist();
    const pending: PendingWhitelistEntry[] = (whitelist as PendingWhitelistEntry[]).filter(
      (w) => w.status === "pending" || w.status === undefined,
    );
    return ok<PendingWhitelistEntry[]>(pending);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/whitelist/pending]", error);
    return err("Internal server error");
  }
}
