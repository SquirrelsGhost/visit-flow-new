import type { ApiResponse } from "@/shared/api/apiResponse";
import type { AuthUser, LoginResponse } from "@/shared/auth/authSchemas";
import { apiRequest, refreshAccessToken } from "../apiClient";
import { effectiveUserPermissions } from "../permissions";
import { getFingerprint, holeGeraetFingerprint } from "../security/fingerprint";
import { loeseLoginPoW } from "../sicherheit/botSchutzClient";
import { kanonischeEmail } from "../sicherheit/emailSchutz";
import { setAccessToken } from "./accessToken";

function enrichUserWithCapabilities(user: AuthUser): AuthUser {
  return {
    ...user,
    permissions: effectiveUserPermissions(user),
  };
}

/**
 * Endpunkte der Anmeldung mit Browser-Micro-PoW (`loeseLoginPoW`),
 * Hardware-Fingerprint (`HW-...`), VF-Shield (`VF-...`) und kanonischer E-Mail.
 */
export async function loginRequest(
  email: string,
  password: string,
  honeypot = "",
): Promise<ApiResponse<LoginResponse>> {
  const pow = await loeseLoginPoW();
  const hwId = holeGeraetFingerprint();
  const vfShield = getFingerprint();
  const canonical = kanonischeEmail(email);

  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "x-pow-ts": String(pow.powTs),
      "x-pow-nonce": String(pow.powNonce),
      "x-device-fingerprint": hwId,
      "x-vf-fingerprint": vfShield,
      "x-canonical-email": canonical,
      ...(honeypot ? { "x-honeypot": honeypot } : {}),
    },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (response.success) {
    setAccessToken(response.data.token);
    response.data = {
      ...response.data,
      user: enrichUserWithCapabilities(response.data.user),
    };
  }
  return response;
}

/** Stellt eine Sitzung über das Refresh-Cookie wieder her und lädt das Profil inkl. Capabilities. */
export async function restoreSession(): Promise<AuthUser | null> {
  if (!(await refreshAccessToken())) return null;
  const profile = await apiRequest<{ user: AuthUser }>("/auth/me");
  return profile.success ? enrichUserWithCapabilities(profile.data.user) : null;
}

export async function logoutRequest(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
  setAccessToken(null);
}
