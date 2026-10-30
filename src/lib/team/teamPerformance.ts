/** Teamleistung je Tag (v1 GET /teams/:id/performance-history): Türen, Sales (Stück) und Umsatz (Provision in €). */
export interface PerformanceDay {
  /** JJJJ-MM-TT (Europe/Berlin) */
  date: string;
  visits: number;
  sales: number;
  umsatz: number;
}

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];

export const METRICS = ["visits", "sales", "umsatz"] as const;
export type Metric = (typeof METRICS)[number];

export type ChartMode = "daily" | "trend";

export interface PerformanceTotals {
  visits: number;
  sales: number;
  umsatz: number;
  /** Sales je 100 Türen. */
  closeRate: number;
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);

/** Antwort der API in Tage übersetzen; unbrauchbare Einträge fallen weg, sortiert nach Datum. */
export function normalizeHistory(raw: unknown): PerformanceDay[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((d): d is Record<string, unknown> => typeof d === "object" && d !== null && typeof (d as { date?: unknown }).date === "string")
    .map((d) => ({ date: String(d.date).slice(0, 10), visits: num(d.visits), sales: num(d.sales), umsatz: num(d.umsatz) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Geladen wird der doppelte Zeitraum: die hintere Hälfte ist der Zeitraum, die vordere der Vergleich (und Vorlauf für den Trend). */
export function splitPeriods(days: readonly PerformanceDay[], period: Period): { current: PerformanceDay[]; previous: PerformanceDay[] } {
  const current = days.slice(-period);
  const previous = days.slice(Math.max(0, days.length - period * 2), Math.max(0, days.length - period));
  return { current, previous };
}

export function totalsOf(days: readonly PerformanceDay[]): PerformanceTotals {
  const visits = days.reduce((s, d) => s + d.visits, 0);
  const sales = days.reduce((s, d) => s + d.sales, 0);
  const umsatz = days.reduce((s, d) => s + d.umsatz, 0);
  return { visits, sales, umsatz, closeRate: visits > 0 ? (sales / visits) * 100 : 0 };
}

/** Veränderung zum Zeitraum davor in Prozent; null ohne Vergleichswert. */
export function changeOf(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Gleitender 7-Tage-Schnitt wie v1 ("7-Tage-Trend"). Die Tage davor dienen als Vorlauf, damit schon der
 * erste Tag des Zeitraums einen vollen Schnitt hat.
 */
export function trendSeries(all: readonly PerformanceDay[], period: Period, metric: Metric, window = 7): number[] {
  const values = all.map((d) => d[metric]);
  const from = Math.max(0, values.length - period);
  return values.slice(from).map((_, i) => {
    const end = from + i;
    const slice = values.slice(Math.max(0, end - window + 1), end + 1);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
}

/** Tage mit Türen oder Sales; Sonntage und freie Tage zählen nicht. */
export const activeDaysOf = (days: readonly PerformanceDay[]) => days.filter((d) => d.visits > 0 || d.sales > 0);

export function bestDayOf(days: readonly PerformanceDay[], metric: Metric): PerformanceDay | null {
  let best: PerformanceDay | null = null;
  for (const d of days) if (d[metric] > 0 && (!best || d[metric] > best[metric])) best = d;
  return best;
}

/** Schnitt je Arbeitstag (nur Tage mit Aktivität). */
export function averagePerActiveDay(days: readonly PerformanceDay[], metric: Metric): number {
  const active = activeDaysOf(days);
  return active.length > 0 ? active.reduce((s, d) => s + d[metric], 0) / active.length : 0;
}

/** Datum als "Do., 23.10." */
export function formatPerfDay(date: string): string {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}
