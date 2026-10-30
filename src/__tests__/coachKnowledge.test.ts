import { describe, expect, it } from "vitest";
import type { CoachProfile } from "../lib/coach/coachTypes";
import { coachFacts, groupMemories } from "../lib/copilot/coachKnowledge";
import type { CoachMemory } from "../lib/copilot/coachMemoryApi";

const profile: CoachProfile = {
  doors: 64,
  met: 30,
  sales: 6,
  hitRate: 47,
  salesRate: 20,
  salesTrend: 2,
  bestWindow: { fromHour: 17, toHour: 19, hitRate: 61, averageRate: 47 },
  weakSpot: "closing",
  topCategory: "KIP",
  rareCategory: null,
  streets: [{ street: "Lindenweg", open: 4 }],
  streakDays: 3,
  today: { doors: 5, sales: 1 },
  learning: false,
};

const memory = (id: string, kind: CoachMemory["kind"], createdAt: string): CoachMemory => ({ id, kind, content: `m${id}`, source: "user", createdAt });

describe("Was Enes über mich weiß", () => {
  it("zeigt die Kennzahlen, die Enes bekommt, aber keine Straßen", () => {
    const facts = coachFacts(profile);
    expect(facts.map((f) => f.key)).toEqual(["doors", "hit", "sales", "window", "spot", "top", "streak"]);
    expect(facts.find((f) => f.key === "window")?.value).toBe("17–19 Uhr");
    expect(JSON.stringify(facts)).not.toContain("Lindenweg");
  });

  it("sagt beim Kennenlernen nur, wie weit es ist", () => {
    expect(coachFacts({ ...profile, doors: 7, learning: true })).toEqual([{ key: "learning", label: expect.any(String), value: "7 / 20 Türen" }]);
  });

  it("ordnet Erinnerungen nach Art und lässt leere weg", () => {
    const groups = groupMemories([memory("1", "win", "2026-10-02"), memory("2", "preference", "2026-10-01"), memory("3", "win", "2026-09-30")]);
    expect(groups.map((g) => [g.kind, g.items.map((m) => m.id)])).toEqual([
      ["preference", ["2"]],
      ["win", ["1", "3"]],
    ]);
  });
});
