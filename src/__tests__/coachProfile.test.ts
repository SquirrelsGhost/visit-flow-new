import { describe, expect, it } from "vitest";
import { coachBriefing, coachContext } from "../lib/coach/coachBriefing";
import { bestWindow, buildCoachProfile, weakSpotOf } from "../lib/coach/coachProfile";
import type { CoachDoor } from "../lib/coach/coachTypes";
import type { MapHouse, VisitStatus } from "../lib/map/mapTypes";

const NOW = new Date(2026, 9, 24, 20, 0).getTime();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function house(id: string, street: string, doors: { at: number; status: VisitStatus; sold?: boolean }[]): MapHouse {
  return {
    id,
    street,
    houseNumber: "1",
    zipCode: "12345",
    city: "Ort",
    type: "MFH",
    latitude: 0,
    longitude: 0,
    status: "offen",
    doors: doors.map((d, i) => ({
      id: `${id}-${i}`,
      name: `Tür ${i}`,
      status: d.status,
      timestamp: new Date(d.at).toISOString(),
      products: d.sold
        ? [{ id: `p${i}`, category: "KIP", subCategory: "", type: "KIP", quantity: 1, isPointRelevant: true, isPremium: false, vertical: "telco", timestamp: new Date(d.at).toISOString() }]
        : [],
    })),
  };
}

const door = (hour: number, notMet: boolean, extra: Partial<CoachDoor> = {}): CoachDoor => ({
  at: new Date(2026, 9, 20, hour).getTime(),
  notMet,
  sold: false,
  appointment: false,
  noInterest: false,
  supplied: false,
  street: "A",
  categories: [],
  ...extra,
});

describe("bestWindow", () => {
  it("findet das Zeitfenster mit klar besseren Antreffern", () => {
    const doors = [...Array.from({ length: 10 }, (_, i) => door(10, i < 8)), ...Array.from({ length: 10 }, (_, i) => door(17, i < 2))];
    expect(bestWindow(doors)).toMatchObject({ fromHour: 16, toHour: 18, hitRate: 80, averageRate: 50 });
  });

  it("schweigt bei zu wenigen Türen je Fenster", () => {
    expect(bestWindow([door(10, false), door(17, false)])).toBeNull();
  });
});

describe("weakSpotOf", () => {
  it("erkennt zu viele Türen ohne Antwort und zu viele Versorgte", () => {
    expect(weakSpotOf(Array.from({ length: 20 }, (_, i) => door(12, i < 12)))).toBe("notMet");
    expect(weakSpotOf(Array.from({ length: 20 }, (_, i) => door(12, false, { supplied: i < 8, sold: i >= 18 })))).toBe("supplied");
  });
});

describe("buildCoachProfile", () => {
  it("rechnet Quoten, Trend, Serie und offene Straßen aus den eigenen Türen", () => {
    const houses = [
      house("h1", "Lindenstraße", [
        { at: NOW - 2 * HOUR, status: "Angetroffen → Sale", sold: true },
        { at: NOW - 3 * HOUR, status: "N/A" },
        { at: NOW - DAY, status: "N/A" },
        { at: NOW - 2 * DAY, status: "Angetroffen → Kein Interesse" },
      ]),
      house("h2", "Kirchweg", [{ at: NOW - 10 * DAY, status: "Angetroffen → Sale", sold: true }]),
      { ...house("t1", "Team", [{ at: NOW - HOUR, status: "N/A" }]), isTeam: true },
    ];
    const profile = buildCoachProfile(houses, "telco", NOW);
    expect(profile).toMatchObject({ doors: 5, met: 3, sales: 2, hitRate: 60, salesRate: 67, salesTrend: 0, streakDays: 3, learning: true });
    expect(profile.today).toEqual({ doors: 2, sales: 1 });
    expect(profile.streets[0]).toEqual({ street: "Lindenstraße", open: 2 });
  });

  it("schickt dem Server keine Straßen", () => {
    const profile = buildCoachProfile([house("h1", "Geheimweg", [{ at: NOW - HOUR, status: "N/A" }])], "telco", NOW);
    expect(JSON.stringify(coachContext(profile))).not.toContain("Geheimweg");
    expect(coachBriefing(profile, "telco").title).toContain("kennen");
  });
});
