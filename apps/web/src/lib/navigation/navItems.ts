import { Calculator, LayoutPanelLeft, Swords, TrendingUp, type LucideIcon } from "lucide-react";
import type { TranslationKey } from "../../texts/i18n/de";

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

/** Höhe der unteren Navigation ohne Safe-Area, wie NAV_HEIGHT in v1. */
export const NAV_HEIGHT = 64;

export const HOME_HREF = "/dashboard";

/** Links und rechts vom Home-Knopf, Reihenfolge wie in v1 (BottomNav.tsx). */
export const NAV_LEFT: readonly NavItem[] = [
  { href: "/battle", labelKey: "nav.battle", icon: Swords },
  { href: "/daily-view", labelKey: "nav.overview", icon: LayoutPanelLeft },
];

/** In v1 wird "Rechner" im Solar-Bereich zu "Aufträge" (/crm); kommt mit der Bereichs-Einstellung. */
export const NAV_RIGHT: readonly NavItem[] = [
  { href: "/statistics", labelKey: "nav.statistics", icon: Calculator },
  { href: "/pattern-analysis-demo", labelKey: "nav.assistant", icon: TrendingUp },
];

/** true, wenn der Link zur aktuellen Seite gehört (auch Unterseiten). */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
