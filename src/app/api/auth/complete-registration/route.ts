import { ok, err } from "@/lib/api";
import type { CompleteRegistrationInput, CompleteRegistrationResult } from "@/lib/register/registerApi";
import { AuthDatabaseService } from "@/services/AuthDatabaseService";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<CompleteRegistrationInput> & {
      honeypot?: unknown;
      powTs?: unknown;
      powNonce?: unknown;
    };
    if (!body.email || !body.name || !body.password) {
      return err("Bitte alle Pflichtfelder ausfüllen.", 400);
    }
    const res = await AuthDatabaseService.completeRegistration(req, {
      email: body.email,
      name: body.name,
      vpkn: body.vpkn ?? "",
      password: body.password,
      verificationCode: body.verificationCode,
      contractStart: body.contractStart,
      requestedTeamId: body.requestedTeamId,
      secondaryEmail: body.secondaryEmail,
      referredBy: body.referredBy,
      honeypot: body.honeypot,
      powTs: body.powTs,
      powNonce: body.powNonce,
    });
    if (!res.ok) {
      return err(res.error, res.status);
    }
    const response = ok<CompleteRegistrationResult>(
      {
        requiresApproval: res.requiresApproval,
        token: res.token,
        user: res.user,
      },
      201,
    );
    response.headers.set("set-cookie", res.setCookie);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/complete-registration]", error);
    return err("Internal server error");
  }
}
