import type { AuthUser } from "@/shared/auth/authSchemas";
import { effectiveUserPermissions, hasPermission, type PermissionBearingUser } from "../permissions";
import { BACKOFFICE_PLAN_ID } from "./backofficeConfig";
import type { BackofficeAccess } from "./backofficeTypes";

/** Führt jemand ein Team? Wie Meine Teams (orgScopeFor "team"): Teamleiter und Gebietsmanager. */
export const leadsTeam = (role: string) => role === "teamleiter" || role === "gebietsmanager";

/** Add-on-Liste aus v1 GET /subscriptions/current (`data.addons`, Plan-Ids aktiver Add-ons). */
export function addonsOf(data: unknown): string[] {
  if (typeof data !== "object" || data === null) return [];
  const list = (data as { addons?: unknown }).addons;
  return Array.isArray(list) ? list.filter((a): a is string => typeof a === "string") : [];
}

/** Admin sieht alles; Sonderrecht team:backoffice oder Teamleiter mit Add-on arbeiten, Teamleiter ohne Add-on sehen das Angebot. */
export function accessFor(user: PermissionBearingUser & { role: string }, addons: readonly string[]): BackofficeAccess {
  const perms = effectiveUserPermissions(user);
  if (hasPermission(perms, "admin:*")) return "admin";
  if (!hasPermission(perms, "team:backoffice") && !leadsTeam(user.role)) return "none";
  const explicitGrant = Array.isArray(user.permissions) && user.permissions.includes("team:backoffice");
  return explicitGrant || addons.includes(BACKOFFICE_PLAN_ID) ? "active" : "locked";
}

/** Team des Nutzers (AuthUser ist offen typisiert). */
export const teamIdOf = (user: AuthUser) => (typeof user.teamId === "string" && user.teamId ? user.teamId : undefined);
