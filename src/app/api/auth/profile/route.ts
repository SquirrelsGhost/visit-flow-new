import { ok, err } from "@/lib/api";
import { AuthDatabaseService } from "@/services/AuthDatabaseService";
import type { AuthUser } from "@/shared/auth/authSchemas";

interface ProfileUpdateResponse {
  user: AuthUser;
}

export async function PATCH(req: Request): Promise<Response> {
  try {
    const patch = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await AuthDatabaseService.updateProfile(req, patch);
    if (!result.ok) {
      return err(result.error, result.status);
    }
    return ok<ProfileUpdateResponse>({ user: result.user });
  } catch (error) {
    console.error("[PATCH /api/auth/profile]", error);
    return err("Internal server error");
  }
}
