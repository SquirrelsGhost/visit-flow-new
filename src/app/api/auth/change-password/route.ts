import { ok, err } from "@/lib/api";
import { AuthDatabaseService } from "@/services/AuthDatabaseService";

interface ChangePasswordResponse {
  changed: boolean;
}

export async function PATCH(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const result = await AuthDatabaseService.changePassword(req, currentPassword, newPassword);
    if (!result.ok) {
      return err(result.error, result.status);
    }
    const response = ok<ChangePasswordResponse>({ changed: true });
    response.headers.set("set-cookie", result.setCookie);
    return response;
  } catch (error) {
    console.error("[PATCH /api/auth/change-password]", error);
    return err("Internal server error");
  }
}
