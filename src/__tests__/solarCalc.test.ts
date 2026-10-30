import { describe, expect, it } from "vitest";
import { autoOptimize, calculateSolar, DEFAULT_SOLAR } from "../lib/solar/solarCalc";

describe("calculateSolar", () => {
  it("rechnet die v1-Standardwerte", () => {
    const r = calculateSolar(DEFAULT_SOLAR);
    expect(r.maxPanels).toBe(30);
    expect(r.kWp).toBe(12.9);
    expect(r.yearlyGenKwh).toBe(13158);
    expect(r.investmentCost).toBe(19190);
    expect(r.monthlyRentalRate).toBe(173);
    expect(r.altMonthlyCost).toBe(127);
  });

  it("zählt beim Direktkauf die Anschaffung einmal in die 20 Jahre", () => {
    const cash = calculateSolar({ ...DEFAULT_SOLAR, mode: "kauf", financed: false });
    const fin = calculateSolar({ ...DEFAULT_SOLAR, mode: "kauf", financed: true });
    expect(cash.newMonthlyCost).toBe(cash.remainingGridCostMonthly);
    expect(fin.newMonthlyCost).toBe(fin.monthlyFinancingRate + fin.remainingGridCostMonthly);
    expect(cash.totalNeu20Years - cash.investmentCost).toBe(fin.totalNeu20Years - fin.monthlyFinancingRate * 12 * 20);
  });

  it("begrenzt die Autarkie ohne Speicher auf 38 %", () => {
    expect(calculateSolar({ ...DEFAULT_SOLAR, batteryKwh: 0, roofSqm: 200 }).autarkyPercent).toBeLessThanOrEqual(38);
  });
});

describe("autoOptimize", () => {
  it("legt 4.000 kWh auf 25 m² und 5 kWh Speicher aus", () => {
    expect(autoOptimize(4000)).toEqual({ roofSqm: 25, batteryKwh: 5 });
  });
});
