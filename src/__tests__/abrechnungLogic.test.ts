import { beforeEach, describe, expect, it } from "vitest";
import { breakdown, EMPTY_FILTER, familyOf, filterPositions } from "../lib/abrechnung/abrechnungBreakdown";
import { demoOpen, demoPatchItems, demoRecord, demoUpload, resetDemoAbrechnung } from "../lib/abrechnung/abrechnungDemoStore";
import { categoryOf, itemAmount, parseAmount, shiftMonth } from "../lib/abrechnung/abrechnungFormat";
import { recalcTotals, unresolvedOf } from "../lib/abrechnung/abrechnungRecalc";
import { viewStatus } from "../lib/abrechnung/abrechnungStatus";
import { historySeries, historyStats, openGroups, summarize } from "../lib/abrechnung/abrechnungSummary";
import type { AbrechnungItem, AbrechnungRecord } from "../lib/abrechnung/abrechnungTypes";

const item = (over: Partial<AbrechnungItem>): AbrechnungItem => ({
  _id: Math.random().toString(36).slice(2),
  date: "10.09.2026",
  street: "Lindenstraße 4",
  customerName: "M. Krüger",
  product: "Giga Zuhause 1000 Kabel",
  amountSystem: 175,
  amountPdf: 175,
  status: "matched",
  reklamiert: false,
  ...over,
});

const record = (items: AbrechnungItem[], pdf: number, file = "a.xlsx"): AbrechnungRecord =>
  recalcTotals({ _id: "r1", month: 8, year: 2026, pdfFileName: file, totalAmountPdf: pdf, totalAmountSystem: 0, differenceAmount: 0, status: "pending", items });

describe("Abrechnung: Rechnen wie v1", () => {
  it("liest deutsche und englische Beträge", () => {
    expect(parseAmount("1.708,50")).toBe(1708.5);
    expect(parseAmount("1708.5")).toBe(1708.5);
    expect(parseAmount("1.708")).toBe(1708);
    expect(parseAmount("-20,00 €")).toBe(-20);
    expect(parseAmount("abc")).toBeNaN();
  });

  it("nimmt je Status den richtigen Betrag", () => {
    expect(itemAmount(item({ status: "missing_in_system", amountSystem: 0, amountPdf: 60 }))).toBe(60);
    expect(itemAmount(item({ status: "missing_in_pdf", amountPdf: 0 }))).toBe(175);
    expect(itemAmount(item({ status: "amount_mismatch", amountPdf: 150 }))).toBe(150);
  });

  it("zählt bei Soll/Ist keine Verkäufe, die ein anderer Monat ausgezahlt hat", () => {
    const rec = record([item({}), item({ status: "cross_matched", crossMonthMatched: true })], 175);
    expect(rec.totalAmountSystem).toBe(175);
    expect(rec.status).toBe("matched");
    const s = summarize(rec);
    expect(s.tone).toBe("ok");
    expect(s.rate).toBe(1);
  });

  it("meldet fehlendes Geld und offene Reklamationen", () => {
    const rec = record([item({}), item({ status: "missing_in_pdf", amountPdf: 0, reklamiert: true })], 175);
    expect(rec.differenceAmount).toBe(-175);
    expect(rec.status).toBe("reklamiert");
    expect(summarize(rec).tone).toBe("missing");
    expect(summarize(record([item({})], 175, "a.pdf")).totalsOnly).toBe(true);
  });

  it("offene Punkte: pending zählt nicht, erledigte Reklamationen auch nicht", () => {
    const rec = record(
      [
        item({ status: "pending" }),
        item({ status: "missing_in_pdf" }),
        item({ status: "missing_in_system" }),
        item({ status: "matched", reklamiert: true, reklamationResolved: true }),
        item({ status: "matched", reklamiert: true }),
      ],
      0,
    );
    const open = unresolvedOf(rec);
    expect(open).toHaveLength(3);
    expect(open[0]?.recordId).toBe("r1");
    expect(openGroups(open).map((g) => [g.key, g.items.length])).toEqual([["unpaid", 1], ["untracked", 1], ["claimed", 1]]);
  });

  it("ordnet Produkte Familien zu und teilt den Monat auf", () => {
    expect(familyOf("GigaTV Home Cable", "vodafone").key).toBe("tv");
    expect(familyOf("Glasfaser 500", "vodafone").key).toBe("glasfaser");
    expect(familyOf("Giga Zuhause 250 Kabel", "vodafone").key).toBe("kabel");
    expect(familyOf("Speicher-Lead", "leads").key).toBe("speicher");
    expect(familyOf("Gas Privat", "energy").key).toBe("gas");
    const slices = breakdown([item({}), item({ product: "GigaTV Home Cable", amountPdf: 25 })], "vodafone");
    expect(slices[0]?.key).toBe("kabel");
    expect(slices.reduce((s, f) => s + f.share, 0)).toBeCloseTo(1);
  });

  it("filtert Positionen nach Status, Familie und Suche", () => {
    const items = [item({ street: "Rosenweg 1" }), item({ status: "missing_in_pdf", product: "GigaTV Home Cable" })];
    expect(filterPositions(items, "vodafone", { ...EMPTY_FILTER, status: "open" })).toHaveLength(1);
    expect(filterPositions(items, "vodafone", { ...EMPTY_FILTER, family: "tv" })).toHaveLength(1);
    expect(filterPositions(items, "vodafone", { ...EMPTY_FILTER, query: "rosen" })).toHaveLength(1);
  });

  it("baut den Verlauf mit Lücken und vergleicht mit dem Vormonat", () => {
    const end = { month: 8, year: 2026 };
    const recs = [record([item({})], 175), { ...record([item({})], 100), _id: "r0", month: 7 }];
    const points = historySeries(recs, end, 6);
    expect(points).toHaveLength(6);
    expect(points.filter((p) => p.hasRecord)).toHaveLength(2);
    expect(historyStats(points).trend).toBeCloseTo(75);
    expect(shiftMonth({ month: 0, year: 2026 }, -1)).toEqual({ month: 11, year: 2025 });
  });

  it("wählt die Kategorie aus dem Bereich", () => {
    expect(categoryOf("telco")).toBe("vodafone");
    expect(categoryOf("solar")).toBe("leads");
    expect(categoryOf("energy")).toBe("energy");
  });
});

describe("Abrechnung: Demo-Speicher", () => {
  const today = new Date(2026, 9, 23);
  beforeEach(() => resetDemoAbrechnung(today));

  it("hat zwölf Monate Historie, aber noch keine Abrechnung für den laufenden Monat", () => {
    expect(demoRecord("vodafone", { month: 9, year: 2026 })).toBeNull();
    expect(demoRecord("vodafone", { month: 8, year: 2026 })?.items.length).toBeGreaterThan(5);
    expect(demoRecord("vodafone", { month: 4, year: 2026 })?.pdfFileName).toMatch(/\.pdf$/);
  });

  it("gleicht eine hochgeladene Excel-Datei ab und übernimmt fehlende Positionen", () => {
    const { record: rec } = demoUpload("leads", { month: 9, year: 2026 }, "Leads.xlsx");
    expect(rec.items.some((i) => i.status === "matched")).toBe(true);
    const untracked = rec.items.filter((i) => i.status === "missing_in_system");
    expect(untracked).toHaveLength(2);
    demoPatchItems("leads", [untracked[0]!._id], (i) => ({ ...i, status: "matched", amountSystem: i.amountPdf }));
    const after = demoRecord("leads", { month: 9, year: 2026 })!;
    expect(viewStatus(after.items.find((i) => i._id === untracked[0]!._id)!)).toBe("paid");
    expect(demoOpen("leads").some((i) => i._id === untracked[0]!._id)).toBe(false);
  });

  it("speichert bei PDF nur die Summe", () => {
    const { record: rec } = demoUpload("energy", { month: 9, year: 2026 }, "Abrechnung.pdf", 1234.5);
    expect(rec.totalAmountPdf).toBe(1234.5);
    expect(rec.items.every((i) => i.status === "pending")).toBe(true);
  });
});
