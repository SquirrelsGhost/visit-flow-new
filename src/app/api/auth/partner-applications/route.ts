import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { SqlUsersRepo } from "@/services/store/sqlUsersRepo";

interface PartnerApplicationItem {
  id: string;
  name: string;
  email: string;
  partnerStatus: string | undefined;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) {
      return err("Nicht authentifiziert.", 401);
    }
    if (!hasPermission(user.permissions, "admin:*")) {
      return err("Keine Berechtigung (admin:*).", 403);
    }
    const all = await SqlUsersRepo.listAll();
    const applications: PartnerApplicationItem[] = all
      .filter((u) => u.partnerStatus)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        partnerStatus: u.partnerStatus,
      }));
    return ok<PartnerApplicationItem[]>(applications);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/auth/partner-applications]", error);
    return err("Internal server error");
  }
}
