import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { toAuthUser } from "@/services/AuthDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";
import { SqlUsersRepo } from "@/services/store/sqlUsersRepo";
import type { AuthUser } from "@/shared/auth/authSchemas";

interface AuthMeResponse {
  user: AuthUser;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser || sessionUser.banned) {
      return err("Nicht authentifiziert", 401);
    }
    const dbUser = await SqlUsersRepo.getById(sessionUser.id);
    const user: AuthUser = dbUser
      ? toAuthUser(dbUser)
      : {
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name,
          role: sessionUser.role,
          roles: sessionUser.roles,
          teamId: sessionUser.teamId,
          teamName: sessionUser.teamName,
          banned: sessionUser.banned,
          sitzungsVersion: sessionUser.sitzungsVersion,
          permissions: sessionUser.permissions,
        };
    return ok<AuthMeResponse>({ user });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/auth/me]", error);
    return err("Internal server error");
  }
}
