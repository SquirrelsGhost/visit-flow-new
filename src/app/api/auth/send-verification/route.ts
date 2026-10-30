import { ok, err } from "@/lib/api";
import { AuthDatabaseService } from "@/services/AuthDatabaseService";

interface SendVerificationResponse {
  sent: boolean;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: unknown; name?: unknown };
    const email = typeof body.email === "string" ? body.email : "";
    const name = typeof body.name === "string" ? body.name : "";
    const res = await AuthDatabaseService.sendVerification(email, name);
    if (!res.ok) {
      return err(res.error, 400);
    }
    return ok<SendVerificationResponse>({ sent: true });
  } catch (error) {
    console.error("[POST /api/auth/send-verification]", error);
    return err("Internal server error");
  }
}
