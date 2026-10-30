import { ok, err } from "@/lib/api";
import { AuthDatabaseService } from "@/services/AuthDatabaseService";
import type { LoginResponse } from "@/shared/auth/authSchemas";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await AuthDatabaseService.login(req, body);
    if (!result.ok) {
      return err(result.error, result.status);
    }
    const response = ok<LoginResponse>(result.data);
    response.headers.set("set-cookie", result.setCookie);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return err("Internal server error");
  }
}
