import type { Role } from "../../shared/auth/roles";
import { effectiveUserPermissions, hasPermission, type PermissionBearingUser } from "../permissions";
import type { OrgScope } from "./orgTypes";

/**
 * Blickwinkel der Seite Meine Teams nach Rolle und Capabilities (Hierarchie wie v1: Admin › Teamleiter › Strukturleiter › Mentor › Berater).
 * Strukturleiter und Mentor zählen auch als Zusatzrolle oder Sonder-Capability; Berater ohne Führungsrecht bekommen keinen.
 */
export function orgScopeFor(
  role: string,
  hasRole: (roles: readonly Role[]) => boolean = () => false,
  user?: PermissionBearingUser | null,
): OrgScope | null {
  const perms = effectiveUserPermissions(user ?? { role });
  if (user && perms.length === 0) return null;
  if (role === "admin" || (user && hasPermission(perms, "admin:users"))) return "all";
  if (role === "teamleiter" || role === "gebietsmanager" || (user && hasPermission(perms, "team:manage"))) return "team";
  if (hasRole(["strukturleiter"]) || (user && hasPermission(perms, "streets:struktur"))) return "group";
  if (hasRole(["mentor"]) || (user && (hasPermission(perms, "streets:mentor") || hasPermission(perms, "team:view")))) return "mentees";
  return null;
}
