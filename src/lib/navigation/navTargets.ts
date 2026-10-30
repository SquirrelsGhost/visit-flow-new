import { Activity, Briefcase, Calculator, CalendarCheck, Car, CreditCard, LayoutPanelLeft, Network, Receipt, Settings, Sparkles, Swords, TrendingUp, User, type LucideIcon } from "lucide-react";
import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Role } from "@/shared/auth/roles";
import type { Vertical } from "../battle/battleCategories";
import type { GlassTone } from "../glass/glassTones";
import type { TranslationKey } from "../../texts/i18n/de";
import { hasAnyRole } from "./userMenuItems";

/** Eine Seite, die auf einen Platz der unteren Leiste gelegt werden kann. */
export interface NavTarget {
  id: string;
  href: string;
  /** Kurzer Name unter dem Symbol in der Leiste. */
  labelKey: TranslationKey;
  icon: LucideIcon;
  /** Farbe des Symbols in der Auswahl. */
  tone: GlassTone;
  /** Nur für diese Rollen (Haupt- oder Zusatzrolle); ohne Angabe für alle. */
  roles?: readonly Role[];
  /** Nur in diesen Sparten; ohne Angabe in allen. */
  verticals?: readonly Vertical[];
}

const LEAD_ROLES: readonly Role[] = ["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor"];

/** Alle Ziele für die Leiste in der Reihenfolge der Auswahl. Neue Seiten hier eintragen. */
export const NAV_TARGETS: readonly NavTarget[] = [
  { id: "battle", href: "/battle", labelKey: "nav.battle", icon: Swords, tone: "red" },
  { id: "overview", href: "/daily-view", labelKey: "nav.overview", icon: LayoutPanelLeft, tone: "blue" },
  { id: "statistics", href: "/statistics", labelKey: "nav.statistics", icon: Calculator, tone: "orange" },
  { id: "assistant", href: "/pattern-analysis-demo", labelKey: "nav.assistant", icon: TrendingUp, tone: "purple" },
  { id: "crm", href: "/crm", labelKey: "nav.crm", icon: Briefcase, tone: "indigo" },
  { id: "abrechnung", href: "/abrechnung", labelKey: "nav.abrechnung", icon: Receipt, tone: "green" },
  { id: "simulator", href: "/provisions-simulator", labelKey: "nav.simulator", icon: Sparkles, tone: "amber" },
  { id: "my-teams", href: "/teams", labelKey: "nav.myTeams", icon: Network, tone: "red", roles: LEAD_ROLES },
  { id: "team-performance", href: "/team-performance", labelKey: "nav.teamPerformance", icon: Activity, tone: "indigo" },
  { id: "daily-status", href: "/daily-status", labelKey: "nav.dailyStatus", icon: CalendarCheck, tone: "gray" },
  { id: "logbook", href: "/fahrtenbuch", labelKey: "nav.logbook", icon: Car, tone: "blue" },
  { id: "licensing", href: "/subscription?licensing=true", labelKey: "nav.licensing", icon: CreditCard, tone: "rose", roles: ["admin", "teamleiter"] },
  { id: "profile", href: "/profile", labelKey: "nav.profile", icon: User, tone: "blue" },
  { id: "settings", href: "/settings", labelKey: "nav.settings", icon: Settings, tone: "gray" },
];

export function findNavTarget(id: string): NavTarget | undefined {
  return NAV_TARGETS.find((target) => target.id === id);
}

/** Ziele, die dieser Nutzer in dieser Sparte sehen darf; ohne Nutzer nur die Ziele ohne Rollen-Vorgabe. */
export function availableNavTargets(user: AuthUser | null, vertical: Vertical): readonly NavTarget[] {
  return NAV_TARGETS.filter(
    (target) =>
      (!target.roles || (user !== null && hasAnyRole(user, target.roles))) &&
      (!target.verticals || target.verticals.includes(vertical)),
  );
}
