import { ok, err } from "@/lib/api";
import type { CreatedTeam, OnboardTeamInput } from "@/lib/onboarding/onboardingApi";
import { TeamOrgDatabaseService } from "@/services/TeamOrgDatabaseService";
import type { AuthUser } from "@/shared/auth/authSchemas";

interface OnboardTeamRouteResponse {
  user: AuthUser;
  token: string;
  stripeCheckoutUrl: string | null;
  team: CreatedTeam;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<OnboardTeamInput>;
    if (!body.teamName || !body.email || !body.password || !body.name) {
      return err("Bitte alle Pflichtfelder für das Team-Onboarding ausfüllen.", 400);
    }
    const result = await TeamOrgDatabaseService.onboardTeam(req, {
      teamName: body.teamName,
      licenseCount: body.licenseCount ?? 5,
      advisorCount: body.advisorCount ?? body.licenseCount ?? 5,
      advisorEmails: body.advisorEmails ?? [],
      planId: body.planId ?? "team-pro",
      name: body.name,
      email: body.email,
      password: body.password,
    });
    const response = ok<OnboardTeamRouteResponse>(
      {
        user: result.user,
        token: result.token,
        stripeCheckoutUrl: result.stripeCheckoutUrl,
        team: result.team,
      },
      201,
    );
    response.headers.set("set-cookie", result.setCookie);
    return response;
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Wegwerf") || error.message.includes("E-Mail"))) {
      const status = error.message.includes("existiert bereits") ? 409 : 400;
      return err(error.message, status);
    }
    console.error("[POST /api/auth/onboard-team]", error);
    return err("Internal server error");
  }
}
