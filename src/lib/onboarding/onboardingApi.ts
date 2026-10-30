import type { ApiResponse } from "@/shared/api/apiResponse";
import type { AuthUser } from "@/shared/auth/authSchemas";
import { apiRequest } from "../apiClient";
import { writePreference } from "../preferences";

export type CheckoutMode = "instant" | "stripe";

export interface OnboardTeamInput {
  teamName: string;
  /** Anzahl Einzel-Lizenzen; advisorCount bleibt für den v1-Endpunkt gleich belegt. */
  licenseCount: number;
  advisorCount: number;
  /** Adressen der Berater, deren Lizenz schon jetzt zugewiesen wird. */
  advisorEmails: string[];
  planId: string;
  checkoutMode: CheckoutMode;
  name: string;
  email: string;
  password: string;
}

export interface CreatedTeam {
  id: string;
  name: string;
  advisorCount: number;
  advisorEmails: string[];
  licenseCount?: number;
  planId: string;
  referralCode: string;
  inviteLink: string;
}

interface OnboardTeamResponse {
  user: AuthUser;
  token: string;
  stripeCheckoutUrl?: string | null;
  team: CreatedTeam;
}

/** v1 hat den Link für spätere Einladungen im Gerät gespeichert, der Schlüssel bleibt gleich. */
const INVITE_KEY = "vf_team_invite_link";

/** Legt Team, Lizenzen und Teamleiter-Zugang in einem Schritt an (gleicher Endpunkt wie v1). */
export async function onboardTeam(input: OnboardTeamInput): Promise<ApiResponse<OnboardTeamResponse>> {
  const response = await apiRequest<OnboardTeamResponse>("/auth/onboard-team", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (response.success) writePreference(INVITE_KEY, response.data.team.inviteLink);
  return response;
}
