import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Role } from "@/shared/auth/roles";
import { hasAnyRole } from "../navigation/userMenuItems";
import { effectiveUserPermissions, hasPermission } from "../permissions";
import { crmTargetFor, type CrmTarget } from "./streetLinks";
import type { StreetTab, StreetView } from "./streetTypes";

/** Wer die Seite öffnen darf (Capabilities + Rollen: Admin-Liste mit admin:streets/streets:*, Team-Liste mit streets:struktur, Mentor-Liste mit streets:mentor). */
export function canOpenStreetList(view: StreetView, user: AuthUser): boolean {
  const perms = effectiveUserPermissions(user);
  if (hasPermission(perms, "admin:streets") || hasPermission(perms, "streets:*")) return true;
  if (view === "struktur") return hasPermission(perms, "streets:struktur") || hasAnyRole(user, ["strukturleiter"]);
  if (view === "mentor") return hasPermission(perms, "streets:mentor") || hasAnyRole(user, ["mentor", "strukturleiter"]);
  return false;
}

/** Beispiel-Führungskraft der Demo, wenn der Demo-Admin die Team- oder Mentor-Liste öffnet. */
const DEMO_LEAD: Record<Exclude<StreetView, "admin">, string> = { struktur: "b4", mentor: "b6" };

export interface StreetScope {
  view: StreetView;
  /** Person, deren Gruppe bzw. Mentees gezeigt werden. */
  meId: string;
  meIsMentor: boolean;
  teamId?: string;
  /** Eigene Gruppen des Strukturleiters (v1 strukturleiterCustomGroups). */
  groups: string[];
  /** Straßen zuweisen: der v1-Server erlaubt das nur Admin und Teamleitung. */
  canAssign: boolean;
  /** Adressen korrigieren, Türen löschen, Bericht mailen und Lösch-Anfragen: nur Admin (wie v1). */
  canManage: boolean;
  /** Wohin "Verkäufe" im Straßen-Sheet führt (CRM-Übersicht, Backoffice oder eigene Aufträge). */
  crm: CrmTarget;
  tabs: StreetTab[];
}

export function streetScopeFor(view: StreetView, user: AuthUser, demo: boolean): StreetScope {
  const perms = effectiveUserPermissions(user);
  const lead: Role = view === "struktur" ? "strukturleiter" : "mentor";
  const asExample = demo && view !== "admin" && !hasAnyRole(user, [lead]);
  const meId = asExample ? DEMO_LEAD[view as Exclude<StreetView, "admin">] : user.id;
  const ownGroups = Array.isArray(user.strukturleiterCustomGroups) ? user.strukturleiterCustomGroups.filter((g): g is string => typeof g === "string") : [];
  return {
    view,
    meId,
    meIsMentor: asExample ? view === "mentor" : hasAnyRole(user, ["mentor"]),
    teamId: typeof user.teamId === "string" ? user.teamId : undefined,
    groups: view !== "struktur" ? [] : asExample ? ["Düsseldorf", "Neuss"] : ownGroups,
    canAssign: hasPermission(perms, "admin:streets") || hasPermission(perms, "team:manage") || hasAnyRole(user, ["admin", "teamleiter"]),
    canManage: view === "admin" && hasPermission(perms, "admin:streets"),
    crm: crmTargetFor(view, user),
    tabs: view === "admin" ? ["deletions", "streets", "activity"] : ["streets", "activity"],
  };
}
