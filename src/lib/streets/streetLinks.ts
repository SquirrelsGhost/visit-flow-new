import type { AuthUser } from "@/shared/auth/authSchemas";
import { leadsTeam } from "../backoffice/backofficeAccess";
import { hasAnyRole } from "../navigation/userMenuItems";
import { can, type PermissionBearingUser } from "../permissions";
import { streetQuery, type StreetRef } from "./streetMatch";
import type { StreetView } from "./streetTypes";

export * from "./streetMatch";

export const STREET_LIST_ROUTES: Record<StreetView, string> = {
  admin: "/admin-street-list",
  struktur: "/strukturleiter-street-list",
  mentor: "/mentor-street-list",
};

/** Welche Straßenliste jemand öffnen darf (Berater keine), wie canOpenStreetList. */
export function streetListViewFor(user: AuthUser): StreetView | null {
  if (can(user, "admin:streets")) return "admin";
  if (hasAnyRole(user, ["strukturleiter"]) || can(user, "streets:struktur")) return "struktur";
  if (hasAnyRole(user, ["mentor"]) || can(user, "streets:mentor")) return "mentor";
  return null;
}

export function streetListHref(view: StreetView, ref: StreetRef): string {
  return `${STREET_LIST_ROUTES[view]}?${streetQuery(ref)}`;
}

/** Wo die Verkäufe einer Straße liegen: Admin-Liste → CRM-Übersicht, Teamleitung → Backoffice, sonst eigene Aufträge. */
export type CrmTarget = { route: "/admin-crm-overview" | "/team-backoffice" | "/crm"; own: boolean };

export function crmTargetFor(view: StreetView, user: PermissionBearingUser & Pick<AuthUser, "role">): CrmTarget {
  if (view === "admin" && can(user, "admin:crm")) return { route: "/admin-crm-overview", own: false };
  if (can(user, "team:backoffice") || leadsTeam(user.role)) return { route: "/team-backoffice", own: false };
  return { route: "/crm", own: true };
}

export function crmHref(target: CrmTarget, ref: StreetRef): string {
  return `${target.route}?${streetQuery(ref)}`;
}

/** Kurzform für Chips: "Lindenstraße · 50667 Köln". */
export const streetLabel = (ref: StreetRef) => [ref.street, [ref.zipCode, ref.city].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
