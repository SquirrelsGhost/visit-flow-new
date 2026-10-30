import { describe, expect, it } from "vitest";
import { accessFor, addonsOf } from "../lib/backoffice/backofficeAccess";
import { BACKOFFICE_PLAN_ID } from "../lib/backoffice/backofficeConfig";
import { actionable, applyStatus, backofficeStats, byStatus, filterBase, sellerSummaries, statusCounts, visibleAddress } from "../lib/backoffice/backofficeLogic";
import { rangeFor } from "../lib/crmOverview/overviewLogic";
import { ALL_USERS, type AdminSale } from "../lib/crmOverview/overviewTypes";

const NOW = new Date(2026, 9, 24, 12);
const at = (day: number) => new Date(2026, 9, day, 10).toISOString();

const sale = (id: string, patch: Partial<AdminSale> = {}): AdminSale => ({
  id,
  doorId: `d-${id}`,
  userId: "u1",
  userName: "Lena",
  customerName: `Kunde ${id}`,
  address: "Lindenallee 12, 50667 Köln",
  category: "Mobilfunk",
  type: "GigaMobil M",
  quantity: 1,
  commissionEuro: 100,
  timestamp: at(20),
  status: "open",
  ...patch,
});

const SALES = [
  sale("a"),
  sale("b", { status: "completed" }),
  sale("c", { status: "cancelled", userId: "u2", userName: "Deniz" }),
  sale("d", { userId: "u2", userName: "Deniz", timestamp: at(3) }),
  sale("e", { category: "Solar_PV", type: "PV-Lead" }),
];

describe("Team-Backoffice: Zugang", () => {
  it("lässt Admins immer rein, Teamleiter nur mit Add-on, Berater gar nicht", () => {
    expect(accessFor({ role: "admin" }, [])).toBe("admin");
    expect(accessFor({ role: "teamleiter" }, [])).toBe("locked");
    expect(accessFor({ role: "teamleiter" }, [BACKOFFICE_PLAN_ID])).toBe("active");
    expect(accessFor({ role: "gebietsmanager" }, [BACKOFFICE_PLAN_ID])).toBe("active");
    expect(accessFor({ role: "berater" }, [BACKOFFICE_PLAN_ID])).toBe("none");
  });

  it("liest die Add-ons aus /subscriptions/current wie v1", () => {
    expect(addonsOf({ addons: ["ai-coach", BACKOFFICE_PLAN_ID, 3] })).toEqual(["ai-coach", BACKOFFICE_PLAN_ID]);
    expect(addonsOf(null)).toEqual([]);
    expect(addonsOf({})).toEqual([]);
  });
});

describe("Team-Backoffice: Logik", () => {
  it("zählt die Reiter und filtert nach Verkäufer, Zeitraum und Suche", () => {
    expect(statusCounts(SALES)).toEqual({ open: 3, completed: 1, cancelled: 1, all: 5 });
    const base = { range: rangeFor("all"), userId: "u2", query: "" };
    expect(filterBase(SALES, base).map((s) => s.id)).toEqual(["c", "d"]);
    expect(filterBase(SALES, { ...base, userId: ALL_USERS, range: rangeFor("week", NOW) }).map((s) => s.id)).not.toContain("d");
    expect(filterBase(SALES, { ...base, userId: ALL_USERS, query: "kunde b" }).map((s) => s.id)).toEqual(["b"]);
    expect(byStatus(SALES, "open").map((s) => s.id)).toEqual(["a", "d", "e"]);
  });

  it("rechnet offene Provision und die Monatsquote je Auftrag", () => {
    const stats = backofficeStats(SALES, NOW);
    expect(stats.open).toBe(3);
    expect(stats.openCommission).toBe(300);
    expect(stats.quote).toBe(20);
  });

  it("stellt Verkäufer mit offenen Verkäufen nach oben", () => {
    const sellers = sellerSummaries(SALES, NOW);
    expect(sellers.map((s) => s.name)).toEqual(["Lena", "Deniz"]);
    expect(sellers[1]).toMatchObject({ open: 1, cancelled: 1, quote: 50 });
  });

  it("zieht Entscheidungen mit Grund nach und lässt Leads aus", () => {
    const next = applyStatus(SALES, new Set(["a"]), "cancelled", "Widerruf");
    expect(next.find((s) => s.id === "a")).toMatchObject({ status: "cancelled", note: "Verlustgrund: Widerruf" });
    expect(actionable(SALES).map((s) => s.id)).not.toContain("e");
    expect(actionable(SALES, "completed").map((s) => s.id)).toEqual(["a", "c", "d"]);
  });

  it("kürzt die Adresse je nach Datenschutz-Einstellung", () => {
    expect(visibleAddress("Lindenallee 12, 50667 Köln", "full")).toBe("Lindenallee 12, 50667 Köln");
    expect(visibleAddress("Lindenallee 12, 50667 Köln", "street")).toBe("Lindenallee, Köln");
    expect(visibleAddress("Am Stadtpark 7a, 53111 Bonn", "street")).toBe("Am Stadtpark, Bonn");
    expect(visibleAddress("Lindenallee 12, 50667 Köln", "none")).toBe("");
  });
});
