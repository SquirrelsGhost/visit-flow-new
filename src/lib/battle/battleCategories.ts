import type { AutoAssignMode, PointConfig } from "./battleTypes";

/** Bereich der App (v1: settings.activeVertical). Solange es die Einstellung noch nicht gibt, gilt Telco. */
export type Vertical = "telco" | "solar" | "energy";

/** Battle-Punkte pro Kategorie, wenn der Server nichts anderes liefert (Standard: 1 Punkt pro Sale). */
export function defaultPoints(vertical: Vertical): PointConfig {
  if (vertical === "energy") return { Strom: 1, Gas: 1 };
  if (vertical === "solar") return { Solar_PV: 1, Solar_Miete: 1, Speicher: 1, Waermepumpe: 1, Wallbox: 1 };
  return { KIP: 1, Glasfaser: 1, GigaTV: 1, KAS: 1, Mobile: 1, Upsell: 1, "Zubehör": 1 };
}

export const CATEGORY_NAMES: Record<string, string> = {
  KIP: "KIP",
  Glasfaser: "Glasfaser",
  GigaTV: "GigaTV",
  KAS: "KAS",
  Mobile: "Mobilfunk",
  Upsell: "Upsell",
  "Zubehör": "Zubehör",
  Solar_PV: "PV-Anlage (Kauf)",
  Solar_Miete: "PV-Anlage (Miete)",
  Speicher: "Batteriespeicher",
  Waermepumpe: "Wärmepumpe",
  Wallbox: "Wallbox",
};

export const CATEGORY_ICONS: Record<string, string> = {
  KIP: "📶",
  Glasfaser: "⚡",
  GigaTV: "📺",
  KAS: "🔧",
  Mobile: "📱",
  Upsell: "⬆️",
  "Zubehör": "🎧",
  Solar_PV: "☀️",
  Solar_Miete: "🪙",
  Speicher: "🔋",
  Waermepumpe: "♨️",
  Wallbox: "🔌",
};

export const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"] as const;

export interface AutoModeOption {
  value: AutoAssignMode;
  label: string;
  description: string;
}

export const AUTO_MODES: readonly AutoModeOption[] = [
  { value: "standard", label: "Standard (Kategorie)", description: "Monat 1-4 vs M1-4, M5+ vs M5+" },
  { value: "month_1_match", label: "Junioren-Fokus", description: "Monat 1 vs M1, Rest ist komplett frei sortiert" },
  { value: "exact_month_match", label: "Exakter Monat", description: "Bsp. M3 vs M3. Restgruppen wenn ungerade" },
  { value: "completely_free", label: "Alle Frei (Zufall)", description: "Jeder gegen jeden im Team, unabhängig vom Monat" },
];

/** Rollen, die in der manuellen Zuweisung auftauchen (wie v1). */
export const ASSIGNABLE_ROLES = ["admin", "berater", "mentor", "strukturleiter", "teamleiter"] as const;

/** Rollen, die Battles verwalten dürfen. */
export const canManageBattles = (role: string | undefined) => role === "admin" || role === "teamleiter";
