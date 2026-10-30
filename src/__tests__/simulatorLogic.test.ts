import { describe, expect, it } from "vitest";
import { clampLeads, LEAD_LIMITS, leadCommission, leadRoleFor } from "../lib/simulator/leadCommission";
import { addTelcoTariff, changeQuantity, tariffsFor } from "../lib/simulator/simulatorBasket";
import { nearestMonth, TELCO_CATEGORIES } from "../lib/simulator/simulatorCatalog";
import { DEMO_TARIFFS } from "../lib/simulator/simulatorDemo";
import { normalizeGrouped } from "../lib/simulator/simulatorApi";
import { autopilot, energyAutopilot } from "../lib/simulator/telcoAutopilot";
import { telcoBonus, unitsOf } from "../lib/simulator/telcoBonus";
import { baseTotal } from "../lib/simulator/simulatorBasket";

const cat = (key: string) => TELCO_CATEGORIES.find((c) => c.key === key)!;
const tariff = (key: string, name: string) => DEMO_TARIFFS[key]!.find((t) => t.name === name)!;
const units = (kip: number, gigatv: number, mobile = 0, upsell = 0) => ({ kip, gigatv, mobile, upsell });

describe("Lead-Provision (v1 1:1)", () => {
  it("Berater: 80 € je Lead, ab 100 rückwirkend 90 €", () => {
    expect(leadCommission("berater", 99).total).toBe(7920);
    expect(leadCommission("berater", 100)).toMatchObject({ total: 9000, bonusActive: true });
  });
  it("Ausbilder, Teamleiter, Partner mit Overhead", () => {
    expect(leadCommission("ausbilder", 400).total).toBe(10000 + 4000);
    expect(leadCommission("teamleiter", 900).total).toBe(7500 + 18000);
    expect(leadCommission("partner", 1300).total).toBe(29900);
  });
  it("Rolle → Stufe und Begrenzung der Eingabe", () => {
    expect(leadRoleFor("mentor")).toBe("ausbilder");
    expect(leadRoleFor("strukturleiter")).toBe("teamleiter");
    expect(leadRoleFor("admin")).toBe("partner");
    expect(leadRoleFor("berater")).toBe("berater");
    expect(clampLeads(5000, LEAD_LIMITS.teamleiter)).toBe(1300);
    expect(clampLeads(10, LEAD_LIMITS.ausbilder)).toBe(400);
  });
});

describe("Telco-Warenkorb", () => {
  it("legt zu jedem Neuvertrag TV Connect zuhause (KAS) dazu und fasst gleiche Tarife zusammen", () => {
    let basket = addTelcoTariff([], tariff("kabel-neu", "Giga Zuhause 1000 Kabel"), cat("kabel-neu"), DEMO_TARIFFS);
    basket = addTelcoTariff(basket, tariff("kabel-neu", "Giga Zuhause 1000 Kabel"), cat("kabel-neu"), DEMO_TARIFFS);
    expect(basket.map((p) => [p.category, p.name, p.quantity])).toEqual([
      ["KIP", "Giga Zuhause 1000 Kabel", 2],
      ["KAS", "TV Connect zuhause", 2],
    ]);
    expect(baseTotal(basket)).toBe(2 * 175 + 2 * 30);
  });
  it("Giga TV zählt als GigaTV, der Rest im TV-Reiter als KAS", () => {
    const basket = addTelcoTariff([], tariff("tv", "Giga TV Home Cable"), cat("tv"), DEMO_TARIFFS);
    expect(basket[0]?.category).toBe("GigaTV");
    expect(addTelcoTariff([], tariff("tv", "Basic TV"), cat("tv"), DEMO_TARIFFS)[0]?.category).toBe("KAS");
  });
  it("Menge 0 entfernt den Posten; Upsell zeigt HSI-Grades und Winback", () => {
    const basket = addTelcoTariff([], tariff("mobil", "GigaMobil M"), cat("mobil"), DEMO_TARIFFS);
    expect(changeQuantity(basket, basket[0]!.id, -1)).toEqual([]);
    expect(tariffsFor("kabel-bestand", DEMO_TARIFFS).map((t) => t.commissionEuro)).toEqual([108, 93, 78, 63, 44, 55, 34]);
  });
});

describe("Bonus-Staffeln", () => {
  it("Junior: KIP + GigaTV zusammen, Pauschale je Stufe", () => {
    expect(telcoBonus(1, units(3, 2), true).total).toBe(1000);
    expect(telcoBonus(1, units(10, 5), true).total).toBe(3000);
  });
  it("Junior Plus: 1.000 € Regulär-Bonus und 750 € Stornoquote ab 10 KIP oder 10 GigaTV", () => {
    expect(telcoBonus(5, units(10, 0), true).total).toBe(10 * 30 + 1000 + 750);
    expect(telcoBonus(5, units(10, 0), false).total).toBe(10 * 30 + 1000);
  });
  it("Regulär: 1.000 € ab 30 KIP+GigaTV+Mobile, Stornoquote erst ab 10 KIP und 10 GigaTV", () => {
    const r = telcoBonus(7, units(10, 10, 10), true);
    expect(r.total).toBe(10 * 30 + 10 * 20 + 10 * 25 + 1000 + 750);
    expect(telcoBonus(7, units(10, 9, 11), true).total).toBe(10 * 30 + 11 * 25 + 1000);
  });
  it("KAS und Zubehör zählen nicht", () => {
    expect(unitsOf([{ id: "a", category: "KAS", name: "x", quantity: 4, commission: 30 }])).toEqual(units(0, 0));
  });
});

describe("Autopilot und Hilfen", () => {
  it("erreicht das Ziel mit Provision und Bonus", () => {
    const basket = autopilot(DEMO_TARIFFS, { target: 10000, month: 7, multiplier: 1, stornoOk: true });
    const provision = baseTotal(basket);
    const bonus = telcoBonus(7, unitsOf(basket), true).total;
    expect(provision + bonus).toBeGreaterThanOrEqual(10000);
    expect(basket.map((p) => p.category)).toEqual(["KIP", "Upsell", "GigaTV", "Mobile"]);
    expect(basket.find((p) => p.category === "GigaTV")?.name).toBe("Giga TV Home Cable");
  });
  it("Energie nimmt den stärksten Tarif", () => {
    expect(energyAutopilot(DEMO_TARIFFS, 500)).toMatchObject([{ name: "Gas Gewerbe", quantity: 5, category: "Gas" }]);
  });
  it("Vertragsmonat aus dem Profil und Server-Antwort normalisieren", () => {
    expect([nearestMonth(null), nearestMonth(3), nearestMonth(9), nearestMonth(20)]).toEqual([5, 3, 7, 13]);
    const grouped = normalizeGrouped({ tv: [{ _id: "1", name: "TV Connect zuhause", commissionEuro: 30, periods: [{ price: 9.99 }] }, { name: "" }], bad: 3 });
    expect(grouped).toEqual({ tv: [{ id: "1", name: "TV Connect zuhause", category: "tv", commissionEuro: 30, bandwidth: undefined, price: 9.99 }] });
  });
});
