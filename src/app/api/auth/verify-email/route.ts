import { ok, err } from "@/lib/api";
import { AuthDatabaseService } from "@/services/AuthDatabaseService";

interface VerifyEmailResponse {
  verified: boolean;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: unknown; code?: unknown };
    const email = typeof body.email === "string" ? body.email : "";
    const code = typeof body.code === "string" ? body.code : "";
    const res = await AuthDatabaseService.verifyCode(email, code);
    if (!res.ok) {
      return err(res.error ?? "Verifizierung fehlgeschlagen", 400);
    }
    return ok<VerifyEmailResponse>({ verified: true });
  } catch (error) {
    console.error("[POST /api/auth/verify-email]", error);
    return err("Internal server error");
  }
}
