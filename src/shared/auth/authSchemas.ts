import { z } from "zod";
import type { Permission } from "@/types/permissions.types";

/**
 * Login-Eingabe. Bewusst nur Länge statt strenger E-Mail-Prüfung: Ein ungewöhnliches
 * Alt-Konto aus v1 soll die gleiche generische Fehlermeldung bekommen wie jeder andere Fehlversuch.
 */
export const loginInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().min(3).max(254),
    password: z.string().min(1).max(200),
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;

/** Nutzer, wie ihn Login und Profil liefern (inkl. granularer Zero-Trust Capabilities). */
export type AuthUser = Record<string, unknown> & {
  id: string;
  email: string;
  role: string;
  name?: string;
  permissions?: Permission[];
  banned?: boolean;
  sitzungsVersion?: number;
};

export interface LoginResponse {
  user: AuthUser;
  token: string;
  showTeamLeiterLiveTracking: boolean;
}

export interface RefreshResponse {
  token: string;
}
