import type { Vertical } from "../battle/battleCategories";
import { demoProducts } from "../battle/battleDemoData";
import { berlinDate } from "./dailyStatus";
import type { PerformanceDay } from "./teamPerformance";

/** Größenordnung eines Teamtags je Sparte: Türen, Sales je Tür, Provision je Sale. */
const SCALE: Record<Vertical, { visits: number; rate: number; euro: number }> = {
  telco: { visits: 190, rate: 0.095, euro: 64 },
  energy: { visits: 150, rate: 0.06, euro: 38 },
  solar: { visits: 120, rate: 0.05, euro: 95 },
};

/** Feste Pseudo-Zufallszahl 0..1 je Datum und Kanal, damit die Demo bei jedem Laden gleich aussieht. */
function noise(date: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (const ch of date) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

function dayOf(date: Date, vertical: Vertical, todayShare: number): PerformanceDay {
  const key = berlinDate(date) ?? "";
  const weekday = date.getDay();
  const scale = SCALE[vertical];
  // Sonntag frei, Samstag halbe Mannschaft, dazu ein leichter Aufwärtstrend in den letzten Wochen
  const crew = weekday === 0 ? 0 : weekday === 6 ? 0.45 : 1;
  const visits = Math.round(scale.visits * crew * (0.75 + noise(key, 1) * 0.5) * todayShare);
  const sales = Math.round(visits * scale.rate * (0.7 + noise(key, 2) * 0.6));
  const umsatz = Math.round(sales * scale.euro * (0.85 + noise(key, 3) * 0.3));
  return { date: key, visits, sales, umsatz };
}

/**
 * Beispielverlauf für die Demo. Heute zählt nur der bisherige Tag; in Telco kommen die Sales von heute aus
 * denselben Beispielverkäufen wie die Battle-Arena, damit beide Seiten dieselbe Zahl zeigen.
 */
export function demoPerformance(days: number, vertical: Vertical, now: Date = new Date()): PerformanceDay[] {
  const result: PerformanceDay[] = [];
  const hour = now.getHours() + now.getMinutes() / 60;
  const todayShare = Math.max(0, Math.min(1, (hour - 9) / 9));
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12);
    result.push(dayOf(date, vertical, i === 0 ? todayShare : 1));
  }
  const today = result[result.length - 1];
  if (today && vertical === "telco") {
    const sold = demoProducts().filter((p) => berlinDate(p.timestamp ?? null) === today.date);
    today.sales = sold.reduce((s, p) => s + Math.max(1, p.quantity ?? 1), 0);
    today.umsatz = sold.reduce((s, p) => s + (p.commissionEuro ?? 0), 0);
    today.visits = Math.max(today.visits, today.sales * 9);
  }
  return result;
}
