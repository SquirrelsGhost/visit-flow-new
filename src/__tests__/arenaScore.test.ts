import { describe, it, expect } from "vitest";
import { berlinDay, dayKey, previousDay, saleCommission, statsByUser } from "../lib/battle/arenaScore";

const upsell = (type: string, extra = {}) => ({ userId: "u1", category: "Upsell", type, ...extra });

describe("saleCommission", () => {
  it("keeps the stored commission for normal sales", () => {
    expect(saleCommission({ userId: "u1", category: "KIP", commissionEuro: 50 })).toBe(50);
  });

  it("pays a plain GigaTV upsell 25 € instead of the cable upsell value", () => {
    expect(saleCommission(upsell("Upsell GigaTV", { commissionEuro: 78 }))).toBe(25);
  });

  it("pays GigaTV grades and takes off a given credit, per unit", () => {
    expect(saleCommission(upsell("Giga TV Upsell Giga Grade 3 · 80€ SG gegeben", { quantity: 2 }))).toBe(34);
    expect(saleCommission(upsell("Giga TV Upsell Giga Grade 3 · 80€ SG NICHT gegeben"))).toBe(35);
    expect(saleCommission(upsell("GigaTV Upsell Giga Grade 1 · 50€ SG gegeben"))).toBe(7.5);
    expect(saleCommission(upsell("GigaTV Upsell Giga Grade 6"))).toBe(40);
  });

  it("fills a missing commission from the grade on other upsells, but never overrides a stored one", () => {
    expect(saleCommission(upsell("Kabel Upsell Giga Grade 2", { commissionEuro: 0 }))).toBe(25);
    expect(saleCommission(upsell("Kabel Upsell Giga Grade 2", { commissionEuro: 60 }))).toBe(60);
  });
});

describe("statsByUser", () => {
  const today = dayKey(new Date());
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 36 * 3600 * 1000).toISOString();

  it("counts only today’s sales that are not excluded, with point multipliers", () => {
    const stats = statsByUser([
      { userId: "a", category: "KIP", commissionEuro: 100, timestamp: now },
      { userId: "a", category: "Mobile", commissionEuro: 20, timestamp: now },
      { userId: "a", category: "KIP", commissionEuro: 100, timestamp: now, battleExcluded: true },
      { userId: "a", category: "KIP", commissionEuro: 100, timestamp: yesterday },
      { userId: "b", category: "KIP", commissionEuro: 90, timestamp: now },
    ], { KIP: 3 }, today);

    expect(stats.get("a")).toEqual({ sales: 2, score: 4, commission: 120 });
    expect(stats.get("b")).toEqual({ sales: 1, score: 3, commission: 90 });
    expect(stats.get("c")).toBeUndefined();
  });
});

describe("Berlin days", () => {
  it("uses the Berlin calendar day, also shortly after midnight", () => {
    expect(berlinDay(new Date("2026-09-29T22:30:00Z"))).toBe("2026-09-30");
    expect(berlinDay(new Date("2026-12-31T22:59:00Z"))).toBe("2026-12-31");
  });

  it("steps back across month and year ends", () => {
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    expect(previousDay("2027-01-01")).toBe("2026-12-31");
  });
});
