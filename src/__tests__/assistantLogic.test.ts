import { describe, expect, it } from "vitest";
import { bonusCategoriesFor, bonusProgress } from "../lib/assistant/bonusTiers";
import { countByCategory, filterKnowledge, KNOWLEDGE_ITEMS, splitSteps } from "../lib/assistant/knowledgeBase";
import { demoMeMetrics } from "../lib/assistant/meDemoData";
import { planMonthGoal, workDays } from "../lib/assistant/monthGoal";
import { portalSetFor } from "../lib/assistant/portalSets";
import { assistantContentFor } from "../lib/assistant/verticalAssistant";
import { leadBonus } from "../lib/assistant/leadBonus";
import { motivationFor } from "../lib/assistant/motivation";

describe("Wissensdatenbank", () => {
  it("enthält alle 25 Einträge aus v1", () => {
    expect(KNOWLEDGE_ITEMS).toHaveLength(25);
  });

  it("filtert nach Kategorie und Suchbegriff (auch in Tags), ohne Groß/klein", () => {
    const einwand = filterKnowledge(KNOWLEDGE_ITEMS, "", "einwand");
    expect(einwand.every((i) => i.category === "einwand")).toBe(true);
    const hits = filterKnowledge(KNOWLEDGE_ITEMS, "  PREIS ", "all");
    expect(hits.length).toBeGreaterThan(0);
    expect(filterKnowledge(KNOWLEDGE_ITEMS, "gibtesnicht", "all")).toHaveLength(0);
  });

  it("zählt je Kategorie passend zur Suche", () => {
    const counts = countByCategory(KNOWLEDGE_ITEMS, "");
    expect(counts).toEqual({ einwand: 8, faq: 6, verkauf: 5, technik: 6 });
  });

  it("trennt die Vorgehensweise ab und lässt kein einzelnes Häkchen übrig", () => {
    const parts = splitSteps("Einleitung.\n\n✅ RICHTIGE VORGEHENSWEISE:\n1. Zuhören");
    expect(parts).toEqual({ intro: "Einleitung.", steps: "1. Zuhören" });
    expect(splitSteps("Nur Text")).toEqual({ intro: "Nur Text", steps: null });
  });
});

describe("Bonus-Staffeln", () => {
  it("nutzt im Vertragsmonat 1–4 die Junior-Staffeln", () => {
    expect(bonusCategoriesFor(2).map((c) => c.id)).toEqual(["kip-gigatv", "mobile"]);
    expect(bonusCategoriesFor(7).map((c) => c.id)).toContain("regulaer-bonus");
  });

  it("rechnet Bonus je Produkt nur bei Produktstaffeln", () => {
    const [kip] = bonusCategoriesFor(7);
    expect(bonusProgress(kip!, 12)).toMatchObject({ reached: { stufe: 1 }, nextTarget: 20, remaining: 8, amount: 360 });
    const junior = bonusCategoriesFor(1)[0]!;
    expect(bonusProgress(junior, 11).amount).toBe(2000);
    expect(bonusProgress(junior, 3)).toMatchObject({ reached: null, amount: 0, nextTarget: 5 });
  });
});

describe("Monatsziel und Zuspruch", () => {
  const now = new Date(2026, 9, 15, 12);

  it("zählt nur Montag bis Freitag als Arbeitstage", () => {
    expect(workDays(now)).toEqual({ total: 22, remaining: 11 });
  });

  it("plant Tagesbedarf und Tempo", () => {
    const plan = planMonthGoal({ targetTotal: 6000, products: [{ name: "KIP", category: "KIP", quantity: 60 }] }, 3000, { rate: 0.1, isPersonalized: true }, now);
    expect(plan.progress).toBe(50);
    expect(plan.remaining).toBe(3000);
    expect(plan.dailyNeeded).toBeCloseTo(3000 / 11);
    expect(plan.dailySalesNeeded).toBeCloseTo(30 / 11);
    expect(plan.doorsPerDay).toBe(28);
    expect(plan.pace.kind).toBe("onTrack");
  });

  it("zeigt Zuspruch nur bei Anlass", () => {
    const m = demoMeMetrics(now);
    expect(motivationFor({ ...m, todaySales: 3, weekVisits: 0 })).toMatchObject({ kind: "strongDay", value: 3 });
    expect(motivationFor({ ...m, todaySales: 0, weekVisits: 0, pointRelevantSales: 2, workDays: 1 })).toBeNull();
  });
});

describe("D2D-Portale je Sparte", () => {
  const ids = (vertical: "telco" | "solar" | "energy") => {
    const set = portalSetFor(vertical);
    return [set.featured.id, ...set.sections.flatMap((s) => s.portals.map((p) => p.id))];
  };

  it("zeigt in Telco Salesworld und D2D Center wie v1", () => {
    expect(ids("telco")).toEqual(expect.arrayContaining(["d2d-center", "salesworld", "bestandskunden"]));
  });

  it("zeigt in Lead (Solar) Lead-Werkzeuge statt Vodafone-Portalen", () => {
    expect(ids("solar")[0]).toBe("lead-erfassen");
    expect(ids("solar")).toEqual(expect.arrayContaining(["lead-partnerportal", "lead-tracker", "mail"]));
    expect(ids("solar")).not.toContain("salesworld");
  });

  it("ersetzt in Energie die Vodafone-Portale durch Energie-Werkzeuge", () => {
    const energy = ids("energy");
    expect(energy[0]).toBe("energie-rechner");
    expect(energy).toEqual(expect.arrayContaining(["energie-partnerportal", "mail", "wechsel-unterlagen"]));
    expect(energy).not.toContain("salesworld");
    expect(energy).not.toContain("d2d-center");
  });
});

describe("KI-Reiter je Sparte", () => {
  it("bringt in Energie eigenes Wissen, eigene Links und keinen Vodafone-Wegweiser", () => {
    const energy = assistantContentFor("energy");
    expect(energy.knowledge).toHaveLength(20);
    expect(new Set(energy.knowledge.map((i) => i.id)).size).toBe(20);
    expect(countByCategory(energy.knowledge, "")).toEqual({ einwand: 6, faq: 5, verkauf: 4, technik: 5 });
    expect(energy.links.every((l) => !l.url.includes("vodafone"))).toBe(true);
    expect(energy.hotline.hasIvr).toBe(false);
    expect(energy.linksKey).not.toBe(assistantContentFor("telco").linksKey);
  });

  it("findet Energie-Einträge über Schlagworte", () => {
    const hits = filterKnowledge(assistantContentFor("energy").knowledge, "malo", "all");
    expect(hits.map((i) => i.id)).toContain("et1");
  });

  it("lässt Telco beim v1-Wissen und gibt Lead eigenes Wissen", () => {
    expect(assistantContentFor("telco").knowledge).toBe(KNOWLEDGE_ITEMS);
    const solar = assistantContentFor("solar");
    expect(countByCategory(solar.knowledge, "")).toEqual({ einwand: 6, faq: 4, verkauf: 4, technik: 4 });
    expect(solar.links.every((l) => !l.url.includes("vodafone"))).toBe(true);
  });

  it("schaltet den Lead-Bonus ab 100 Netto-Leads frei", () => {
    expect(leadBonus(64)).toEqual({ progress: 64, remaining: 36, reached: false });
    expect(leadBonus(120)).toEqual({ progress: 100, remaining: 0, reached: true });
  });
});
