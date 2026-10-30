import { Smartphone, Sun, Zap, type LucideIcon } from "lucide-react";
import type { AuthUser } from "@/shared/auth/authSchemas";
import type { Vertical } from "../battle/battleCategories";
import { can } from "../permissions";

export interface VerticalOption {
  id: Vertical;
  /** Kurzname im Knopf der Topbar. */
  label: string;
  /** Langer Name in der Auswahl, wie in v1 (ohne Emoji). */
  menuLabel: string;
  icon: LucideIcon;
  /** Symbolfarbe im Knopf und in der Liste. */
  iconTone: string;
  /** Hintergrund und Schrift der gewählten Zeile. */
  activeTone: string;
}

/** Sparten aus v1 (MainHeader.tsx), gleiche Reihenfolge und Farben. */
export const VERTICAL_OPTIONS: readonly VerticalOption[] = [
  {
    id: "telco",
    label: "Telco",
    menuLabel: "Telco (Vodafone)",
    icon: Smartphone,
    iconTone: "text-blue-500",
    activeTone: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  {
    id: "energy",
    label: "Energie",
    menuLabel: "Energie (Strom/Gas)",
    icon: Zap,
    iconTone: "text-amber-500",
    activeTone: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  },
  {
    id: "solar",
    label: "Lead",
    menuLabel: "Lead (PV-Anlagen)",
    icon: Sun,
    iconTone: "text-emerald-500",
    activeTone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
];

/** Sparten, zwischen denen der Nutzer wechseln darf: Admins alle, sonst die freigegebenen (allowedVerticals in v1). */
export function allowedVerticals(user: AuthUser): readonly VerticalOption[] {
  if (can(user, "admin:*")) return VERTICAL_OPTIONS;
  const allowed: unknown[] = Array.isArray(user.allowedVerticals) ? user.allowedVerticals : [];
  return VERTICAL_OPTIONS.filter((option) => allowed.includes(option.id));
}

/** Der Umschalter erscheint wie in v1 nur, wenn es mehr als eine Sparte zur Wahl gibt. */
export function canSwitchVertical(user: AuthUser): boolean {
  return allowedVerticals(user).length > 1;
}
