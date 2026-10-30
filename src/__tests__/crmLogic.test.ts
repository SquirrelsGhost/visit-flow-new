import { beforeEach, describe, expect, it } from "vitest";
import { demoDiscard, demoLoad, demoSetStatus, markNotes, resetDemoCrm } from "../lib/crm/crmDemoStore";
import { canComplete, filterOrders, groupOrders, monthCounts, ordersOfVertical, parseNote, salesToRecover, splitByAge, statusOf, stornoBuffer, stornoOk } from "../lib/crm/crmLogic";
import type { SaleRecord } from "../lib/crm/crmTypes";

const NOW = new Date("2026-10-23T15:00:00").getTime();
const DAY = 24 * 60 * 60 * 1000;

const sale = (over: Partial<SaleRecord>): SaleRecord => ({
  id: Math.random().toString(36).slice(2),
  doorId: "d1",
  category: "KIP",
  type: "GigaZuhause 1000",
  quantity: 1,
  timestamp: new Date(NOW - 2 * DAY).toISOString(),
  commissionEuro: 100,
  customerName: "Krüger",
  address: "Lindenstraße 4, 50667 Köln",
  ...over,
});

describe("Aufträge: Logik wie v1 CRMPage", () => {
  it("liest den Status aus den Notizmarken", () => {
    expect(statusOf("[STORNIERT] x")).toBe("cancelled");
    expect(statusOf("[ABGESCHLOSSEN]")).toBe("completed");
    expect(statusOf("Rückruf")).toBe("open");
  });

  it("trennt Notiz und Verlustgrund", () => {
    expect(parseNote("[STORNIERT] Kunde verreist (Verlustgrund: Widerruf)")).toEqual({ note: "Kunde verreist", lostReason: "Widerruf" });
    expect(parseNote("[ABGESCHLOSSEN]")).toEqual({ note: undefined, lostReason: undefined });
  });

  it("fasst Produkte einer Tür am selben Tag zu einem Auftrag zusammen", () => {
    const orders = groupOrders([sale({}), sale({ category: "KAS", type: "TV Connect", commissionEuro: 10 }), sale({ doorId: "d2" })], NOW);
    expect(orders).toHaveLength(2);
    const first = orders.find((o) => o.doorId === "d1")!;
    expect(first.products).toHaveLength(2);
    expect(first.totalCommission).toBe(110);
    expect(first.daysSince).toBe(2);
  });

  it("ein storniertes Produkt macht den Auftrag storniert, abgeschlossen erst mit allen", () => {
    const [cancelled] = groupOrders([sale({}), sale({ notes: "[STORNIERT]" })], NOW);
    expect(cancelled!.status).toBe("cancelled");
    const [partial] = groupOrders([sale({ notes: "[ABGESCHLOSSEN]" }), sale({})], NOW);
    expect(partial!.status).toBe("open");
  });

  it("zählt den Monat je Auftrag und rechnet die Stornoquote", () => {
    const sales = [
      sale({ doorId: "a" }),
      sale({ doorId: "a", type: "Zweites Produkt" }),
      sale({ doorId: "b", notes: "[STORNIERT]" }),
      sale({ doorId: "c", notes: "[ABGESCHLOSSEN]" }),
      sale({ doorId: "d" }),
      sale({ doorId: "old", timestamp: new Date("2026-09-10T12:00:00").toISOString() }),
    ];
    const counts = monthCounts(groupOrders(sales, NOW), new Date(NOW));
    expect(counts).toMatchObject({ sales: 3, stornos: 1, open: 2, completed: 1, quote: 25, commission: 400 });
    expect(stornoOk(counts.quote)).toBe(false);
    expect(stornoOk(null)).toBe(true);
  });

  it("sagt, wie viele Stornos bis 15 % noch gehen", () => {
    expect(stornoBuffer({ sales: 19, stornos: 1 })).toBe(2);
    expect(stornoBuffer({ sales: 5, stornos: 2 })).toBe(0);
    expect(salesToRecover({ sales: 9, stornos: 2 })).toBe(3);
    expect(salesToRecover({ sales: 19, stornos: 1 })).toBe(0);
  });

  it("schließt erst nach 14 Tagen ab und teilt nach Alter", () => {
    const orders = groupOrders([sale({ doorId: "new" }), sale({ doorId: "old", timestamp: new Date(NOW - 20 * DAY).toISOString() })], NOW);
    const { recent, older } = splitByAge(orders, "telco");
    expect(recent.map((o) => o.doorId)).toEqual(["new"]);
    expect(older.map((o) => o.doorId)).toEqual(["old"]);
    expect(canComplete(recent[0]!)).toBe(false);
    expect(canComplete(older[0]!)).toBe(true);
    expect(splitByAge(orders, "solar").older).toHaveLength(1);
  });

  it("filtert nach Status, Suche und Bereich", () => {
    const sales = [sale({ doorId: "a", customerName: "Yilmaz" }), sale({ doorId: "b", notes: "[STORNIERT]" }), sale({ doorId: "s", category: "Solar_PV", type: "Direkt-Lead" })];
    const telco = groupOrders(ordersOfVertical(sales, "telco"), NOW);
    expect(telco).toHaveLength(2);
    expect(filterOrders(telco, "cancelled", "")).toHaveLength(1);
    expect(filterOrders(telco, "all", "yil")).toHaveLength(1);
    expect(groupOrders(ordersOfVertical(sales, "solar"), NOW)).toHaveLength(1);
  });
});

describe("Aufträge: Demo-Speicher", () => {
  beforeEach(() => resetDemoCrm());

  it("setzt Marken wie der v1-Server", () => {
    expect(markNotes("Rückruf", "cancelled")).toBe("[STORNIERT] Rückruf");
    expect(markNotes("[ABGESCHLOSSEN] x", "cancelled")).toBe("[STORNIERT] x");
  });

  it("storniert und verwirft im Tab", () => {
    const first = demoLoad()[0]!;
    demoSetStatus([first.id], "cancelled");
    expect(statusOf(demoLoad()[0]!.notes)).toBe("cancelled");
    demoDiscard([first.id]);
    expect(demoLoad().some((s) => s.id === first.id)).toBe(false);
  });
});
