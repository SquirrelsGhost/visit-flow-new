import type { ApiResponse } from "@visit-flow/shared/api";
import type { AuthUser, LoginResponse } from "@visit-flow/shared/auth";
import { apiRequest, refreshAccessToken } from "../apiClient";
import { setAccessToken } from "./accessToken";

/** Endpunkte der Anmeldung (v2-API, gleiche Pfade wie v1). */
export async function loginRequest(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (response.success) setAccessToken(response.data.token);
  return response;
}

/** Stellt eine Sitzung über das Refresh-Cookie wieder her und lädt das Profil. */
export async function restoreSession(): Promise<AuthUser | null> {
  if (!(await refreshAccessToken())) return null;
  const profile = await apiRequest<{ user: AuthUser }>("/auth/me");
  return profile.success ? profile.data.user : null;
}

export async function logoutRequest(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
  setAccessToken(null);
}
