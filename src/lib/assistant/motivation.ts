import type { Vertical } from "../battle/battleCategories";
import type { MeMetrics } from "./meTypes";

export type MotivationKind = "goalReached" | "strongDay" | "almostBonus" | "consistent";

export interface Motivation {
  kind: MotivationKind;
  tone: "success" | "warning";
  value?: number;
}

/** Banner nur bei echtem Anlass, Reihenfolge und Schwellen wie v1 getMotivationMessage. */
export function motivationFor(m: MeMetrics, vertical: Vertical = "telco"): Motivation | null {
  if (m.weeklyTarget > 0 && m.weekVisits >= m.weeklyTarget) return { kind: "goalReached", tone: "success" };
  if (m.todaySales >= 3) return { kind: "strongDay", tone: "success", value: m.todaySales };
  // Punkte-Bonus gibt es nur bei Telco (Vodafone-Staffeln)
  if (vertical === "telco" && m.pointRelevantSales >= 8 && m.pointRelevantSales < 10) {
    return { kind: "almostBonus", tone: "warning", value: m.pointRelevantSales };
  }
  if (m.workDays >= 4) return { kind: "consistent", tone: "success", value: m.workDays };
  return null;
}
