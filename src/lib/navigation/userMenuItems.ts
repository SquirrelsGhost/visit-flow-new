import { Activity, CalendarCheck, Car, ClipboardCheck, Clock, CreditCard, Database, FileText, Lock, MapPin, Network, Settings, Shield, Trophy, User, type LucideIcon } from "lucide-react";
import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Role } from "@/shared/auth/roles";
import { effectiveUserPermissions, hasPermission, sanitizePermissions } from "../permissions";
import type { TranslationKey } from "../../texts/i18n/de";

export interface UserMenuLink {
  id: string;
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  /** Farben des Symbol-Kästchens wie in v1. */
  tone: string;
}

export interface UserMenuGroup {
  id: string;
  /** Kleine Überschrift über der Gruppe; v1 trennte nur mit einer Linie. */
  captionKey?: TranslationKey;
  items: readonly UserMenuLink[];
}

const TONE = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  green: "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
  red: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
} as const;

/** In v1 Dialoge im Header, in v2 eigene Glas-Seiten (/daily-status, /team-performance). */
const STATUS_ITEMS: readonly UserMenuLink[] = [
  { id: "daily-status", href: "/daily-status", labelKey: "nav.dailyStatus", icon: CalendarCheck, tone: TONE.slate },
  { id: "team-performance", href: "/team-performance", labelKey: "nav.teamPerformance", icon: Activity, tone: TONE.indigo },
  { id: "logbook", href: "/fahrtenbuch", labelKey: "nav.logbook", icon: Car, tone: TONE.blue },
];

/** Eigene Struktur als Baum mit Verwaltung (v2, gibt es in v1 nicht); nur für Führungsrollen. */
const MY_TEAMS: UserMenuLink = { id: "my-teams", href: "/teams", labelKey: "nav.myTeams", icon: Network, tone: TONE.red };
const LEAD_ROLES: readonly Role[] = ["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor"];

/** Team-Backoffice (v2, Add-on für Teams): Teamleiter ohne Add-on landen auf dem Angebot. */
const BACKOFFICE: UserMenuLink = { id: "team-backoffice", href: "/team-backoffice", labelKey: "header.teamBackoffice", icon: ClipboardCheck, tone: TONE.orange };

const LICENSING: UserMenuLink = {
  id: "team-licensing",
  href: "/subscription?licensing=true",
  labelKey: "header.teamLicensing",
  icon: CreditCard,
  tone: TONE.pink,
};

/** Reihenfolge wie activeShortcuts in v1 (MainHeader.tsx): Security Dashboard zuerst, dann die Admin-Liste. */
const ADMIN_ITEMS: readonly UserMenuLink[] = [
  { id: "security-dashboard", href: "/security-dashboard", labelKey: "nav.securityDashboard", icon: Lock, tone: TONE.rose },
  { id: "admin-street-list", href: "/admin-street-list", labelKey: "header.adminStreetList", icon: MapPin, tone: TONE.purple },
  { id: "admin-crm-overview", href: "/admin-crm-overview", labelKey: "header.crmOverview", icon: Database, tone: TONE.red },
  BACKOFFICE,
  { id: "expiring-contracts", href: "/expiring-contracts", labelKey: "header.expiringContracts", icon: Clock, tone: TONE.purple },
  { id: "admin-dashboard", href: "/admin-dashboard", labelKey: "header.adminDashboard", icon: Shield, tone: TONE.orange },
  LICENSING,
];

const TEAMLEITER_ITEMS: readonly UserMenuLink[] = [
  BACKOFFICE,
  { id: "teamleiter-reports", href: "/teamleiter-berichte", labelKey: "header.teamleiterReports", icon: FileText, tone: TONE.blue },
  { id: "crm-integration", href: "/crm-integration", labelKey: "header.teamCrm", icon: Database, tone: TONE.emerald },
  LICENSING,
];

const STRUKTURLEITER_ITEMS: readonly UserMenuLink[] = [
  { id: "strukturleiter-street-list", href: "/strukturleiter-street-list", labelKey: "header.teamStreetList", icon: MapPin, tone: TONE.indigo },
];

const MENTOR_ITEMS: readonly UserMenuLink[] = [
  { id: "mentor-street-list", href: "/mentor-street-list", labelKey: "header.mentorStreetList", icon: MapPin, tone: TONE.green },
];

const PROFILE: UserMenuLink = { id: "profile", href: "/profile", labelKey: "nav.profile", icon: User, tone: TONE.blue };
const PARTNER: UserMenuLink = { id: "partner", href: "/partners/dashboard", labelKey: "header.partnerProgram", icon: Trophy, tone: TONE.red };
/** Datenschutz liegt wie in v1 in den Einstellungen (Reiter Sicherheit), nicht als eigener Menüpunkt. */
const SETTINGS: UserMenuLink = { id: "settings", href: "/settings", labelKey: "nav.settings", icon: Settings, tone: TONE.purple };

/** Alle Ziele aus dem Menü, unabhängig von der Rolle; daraus liest die Topbar den Seitentitel. */
export const ALL_USER_MENU_LINKS: readonly UserMenuLink[] = [
  MY_TEAMS,
  ...STATUS_ITEMS,
  ...ADMIN_ITEMS,
  ...TEAMLEITER_ITEMS,
  ...STRUKTURLEITER_ITEMS,
  ...MENTOR_ITEMS,
  PROFILE,
  PARTNER,
  SETTINGS,
];

/** Hauptrolle oder Zusatzrolle aus `roles`, wie hasAnyRole in v1. */
export function hasAnyRole(user: AuthUser, roles: readonly Role[]): boolean {
  const extra: unknown[] = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => user.role === role || extra.includes(role));
}

/** Gruppen der Rollen- & Capability-Kurzbefehle. Unterstützt sowohl granulare `permissions` als auch Rollen-Presets. */
function roleGroups(user: AuthUser, perms = effectiveUserPermissions(user)): UserMenuGroup[] {
  const groups: UserMenuGroup[] = [];
  const explicitPerms = sanitizePermissions(user.permissions);
  const isAdmin = hasPermission(perms, "admin:*") || hasPermission(explicitPerms, "admin:*");
  if (isAdmin) groups.push({ id: "admin", captionKey: "header.sectionAdmin", items: ADMIN_ITEMS });
  if (!isAdmin && hasPermission(perms, "team:licensing")) groups.push({ id: "teamleiter", captionKey: "header.sectionTeamleiter", items: TEAMLEITER_ITEMS });
  const isStrukturleiter = hasAnyRole(user, ["strukturleiter"]) || hasPermission(explicitPerms, "streets:struktur");
  if (isStrukturleiter) groups.push({ id: "strukturleiter", captionKey: "header.sectionStruktur", items: STRUKTURLEITER_ITEMS });
  if (!isStrukturleiter && (hasAnyRole(user, ["mentor"]) || hasPermission(explicitPerms, "streets:mentor"))) {
    groups.push({ id: "mentor", captionKey: "header.sectionMentor", items: MENTOR_ITEMS });
  }
  return groups;
}

/** Menü unter dem Avatar in der Reihenfolge von v1 (Führung zuerst mit Meine Teams): Status, Rollen-Kurzbefehle, Konto. Abmelden hängt das Menü selbst an. */
export function buildUserMenu(user: AuthUser): UserMenuGroup[] {
  const perms = effectiveUserPermissions(user);
  const showPartner = hasPermission(perms, "partner:dashboard");
  const account = showPartner ? [PROFILE, PARTNER, SETTINGS] : [PROFILE, SETTINGS];
  const status = hasAnyRole(user, LEAD_ROLES) || hasPermission(perms, "team:view") ? [MY_TEAMS, ...STATUS_ITEMS] : STATUS_ITEMS;
  return [{ id: "status", items: status }, ...roleGroups(user, perms), { id: "account", items: account }];
}
