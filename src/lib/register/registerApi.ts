import type { ApiResponse } from "@/shared/api/apiResponse";
import type { AuthUser } from "@/shared/auth/authSchemas";
import { apiRequest } from "../apiClient";

/** Endpunkte der Berater-Registrierung, gleiche Pfade wie v1 (httpAuthService). */

export interface PublicTeam {
  id: string;
  name: string;
}

export interface CompleteRegistrationInput {
  email: string;
  name: string;
  vpkn: string;
  password: string;
  verificationCode: string;
  contractStart?: string;
  requestedTeamId?: string;
  secondaryEmail?: string;
  secondaryVerificationCode?: string;
  referredBy?: string;
}

export interface CompleteRegistrationResult {
  requiresApproval?: boolean;
  token?: string;
  user?: AuthUser;
}

/** v1 schickt bei abgelaufenem Code automatisch einen neuen und meldet das mit codeExpired. */
export type RegistrationResponse = ApiResponse<CompleteRegistrationResult> & { codeExpired?: boolean };

const post = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) });

export function sendVerificationCode(email: string, name: string) {
  return post<unknown>("/auth/send-verification", { email: email.trim().toLowerCase(), name: name.trim() });
}

export function verifyEmailCode(email: string, code: string) {
  return post<unknown>("/auth/verify-email", { email: email.trim().toLowerCase(), code });
}

export function completeRegistration(input: CompleteRegistrationInput): Promise<RegistrationResponse> {
  return post<CompleteRegistrationResult>("/auth/complete-registration", input);
}

interface RawTeam {
  id?: string;
  _id?: string;
  name?: string;
}

/** v1 antwortet hier teils mit, teils ohne { success, data }-Hülle. */
function unwrap<T>(body: unknown): T | undefined {
  if (body && typeof body === "object" && "data" in body) return (body as { data: T }).data;
  return body as T | undefined;
}

/** Öffentliche Teamliste für die Auswahl. Fehler sind still, dann bleibt nur "Kein Team". */
export async function loadPublicTeams(): Promise<PublicTeam[]> {
  const teams = unwrap<RawTeam[]>(await apiRequest<RawTeam[]>("/teams/public/list"));
  if (!Array.isArray(teams)) return [];
  return teams
    .map((team) => ({ id: String(team.id ?? team._id ?? ""), name: String(team.name ?? "") }))
    .filter((team) => team.id && team.name);
}

/** Admin-Schalter aus v1: Firmenmail-Pflicht für Vodafone-Teams aussetzen. */
export async function loadCompanyEmailBypass(): Promise<boolean> {
  type Status = { bypassCompanyEmailRequirement?: boolean };
  const status = unwrap<Status>(await apiRequest<Status>("/system-status"));
  return status?.bypassCompanyEmailRequirement === true;
}
