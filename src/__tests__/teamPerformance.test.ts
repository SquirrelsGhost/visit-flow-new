import { describe, expect, it } from "vitest";
import { niceMax, smoothPath, tickIndexes } from "../lib/team/chartPath";
import { demoPerformance } from "../lib/team/performanceDemo";
import { averagePerActiveDay, bestDayOf, changeOf, normalizeHistory, splitPeriods, totalsOf, trendSeries, type PerformanceDay } from "../lib/team/teamPerformance";

const day = (date: string, visits: number, sales: number, umsatz: number): PerformanceDay => ({ date, visits, sales, umsatz });

describe("Teamleistung", () => {
  it("liest die v1-Antwort und teilt in Zeitraum und Vergleich", () => {
    const days = normalizeHistory([{ date: "2026-10-02", visits: 4, sales: 1, umsatz: 50 }, { date: "2026-10-01", visits: "2" }, { nope: 1 }]);
    expect(days).toEqual([day("2026-10-01", 2, 0, 0), day("2026-10-02", 4, 1, 50)]);
    const { current, previous } = splitPeriods([...days, day("2026-10-03", 1, 0, 0)], 7);
    expect(current).toHaveLength(3);
    expect(previous).toHaveLength(0);
  });

  it("rechnet Summen, Quote, Veränderung, besten Tag und Schnitt je Arbeitstag", () => {
    const days = [day("a", 100, 10, 500), day("b", 0, 0, 0), day("c", 50, 5, 300)];
    expect(totalsOf(days)).toEqual({ visits: 150, sales: 15, umsatz: 800, closeRate: 10 });
    expect(changeOf(120, 100)).toBe(20);
    expect(changeOf(5, 0)).toBeNull();
    expect(bestDayOf(days, "umsatz")?.date).toBe("a");
    expect(averagePerActiveDay(days, "visits")).toBe(75);
  });

  it("glättet den 7-Tage-Trend mit den Tagen davor als Vorlauf", () => {
    const days = Array.from({ length: 14 }, (_, i) => day(String(i), i < 7 ? 7 : 0, 0, 0));
    const trend = trendSeries(days, 7, "visits");
    expect(trend).toHaveLength(7);
    expect(trend[0]).toBe(6);
    expect(trend[6]).toBe(0);
  });

  it("baut einen festen Demo-Verlauf mit freiem Sonntag", () => {
    const now = new Date(2026, 9, 23, 18);
    const a = demoPerformance(14, "energy", now);
    expect(a).toHaveLength(14);
    expect(a).toEqual(demoPerformance(14, "energy", now));
    expect(a.find((d) => new Date(`${d.date}T12:00`).getDay() === 0)?.visits).toBe(0);
  });

  it("zeichnet Achse und Linie robust", () => {
    expect(niceMax(173)).toBe(200);
    expect(niceMax(0)).toBe(1);
    expect(tickIndexes(30)).toEqual([0, 7, 15, 22, 29]);
    expect(smoothPath([{ x: 0, y: 10 }], 0, 100)).toBe("M0,10");
    expect(smoothPath([{ x: 0, y: 10 }, { x: 10, y: 90 }, { x: 20, y: 10 }], 0, 100)).toMatch(/^M0\.0,10\.0 C/);
  });
});
