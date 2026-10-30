import { describe, expect, it } from "vitest";
import { dayLabel, filterBattles, leadingSide, shiftDay, statusCounts } from "../lib/battle/battleLogs";
import type { AdminBattle } from "../lib/battle/battleTypes";

const battle = (id: string, a: string, o: string, status: string, sa = 0, so = 0): AdminBattle => ({
  _id: id,
  challengerName: a,
  opponentName: o,
  challengerScore: sa,
  opponentScore: so,
  status,
  isAutoAssigned: false,
  date: "2026-10-23",
  createdAt: "2026-10-23T08:00:00Z",
});

const list = [battle("1", "Sarah Klein", "Julia Wagner", "active"), battle("2", "Tim Hoffmann", "Lukas Berger", "completed"), battle("3", "Aylin Demir", "Noah Fischer", "cancelled_sick")];
const WORDS = { today: "Heute", yesterday: "Gestern" };

describe("filterBattles", () => {
  it("finds a person on either side, ignoring case", () => {
    expect(filterBattles(list, "julia", "all").map((b) => b._id)).toEqual(["1"]);
    expect(filterBattles(list, "LUKAS", "all").map((b) => b._id)).toEqual(["2"]);
  });

  it("combines search and status", () => {
    expect(filterBattles(list, "", "completed").map((b) => b._id)).toEqual(["2"]);
    expect(filterBattles(list, "sarah", "completed")).toEqual([]);
  });
});

describe("statusCounts", () => {
  it("counts only the statuses present", () => {
    expect(statusCounts(list)).toEqual({ active: 1, completed: 1, cancelled_sick: 1 });
  });
});

describe("days", () => {
  it("shifts across month ends", () => {
    expect(shiftDay("2026-11-01", -1)).toBe("2026-10-31");
    expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("names today and yesterday, otherwise a short date", () => {
    expect(dayLabel("2026-10-23", "2026-10-23", WORDS)).toBe("Heute");
    expect(dayLabel("2026-10-22", "2026-10-23", WORDS)).toBe("Gestern");
    expect(dayLabel("2026-10-20", "2026-10-23", WORDS)).toBe("Di., 20.10.");
  });
});

describe("leadingSide", () => {
  it("knows the leader and a draw", () => {
    expect(leadingSide(battle("x", "A", "B", "completed", 5, 3))).toBe("challenger");
    expect(leadingSide(battle("x", "A", "B", "completed", 1, 4))).toBe("opponent");
    expect(leadingSide(battle("x", "A", "B", "completed", 3, 3))).toBeNull();
  });
});
