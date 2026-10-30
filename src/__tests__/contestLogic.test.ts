import { describe, expect, it } from "vitest";
import { contestClock, contestsByScope, contestsForUser, contestStandings, ownStandingId } from "../lib/overview/contestLogic";
import type { Contest } from "../lib/overview/contestTypes";
import type { TeamProduct, TeamUser } from "../lib/overview/teamTypes";

const NOW = new Date(2026, 9, 23, 12, 0);
const base: Contest = {
  id: "c1", teamId: "t1", name: "Sprint", type: "all", contestType: "race",
  goals: [{ category: "KIP", target: 4 }, { category: "Mobile", target: 2 }], prizes: [{ rank: 1, prize: "Gutschein" }],
  startDate: new Date(2026, 9, 20).toISOString(), endDate: new Date(2026, 9, 30).toISOString(), status: "active", createdBy: "x", createdAt: "",
};
const users: TeamUser[] = [
  { id: "a", name: "Anna", role: "berater", teamId: "t1" },
  { id: "b", name: "Ben", role: "berater", teamId: "t1" },
  { id: "c", name: "Cem", role: "berater", teamId: "t1", battleInactive: true },
  { id: "d", name: "Dora", role: "berater", teamId: "t2" },
];
const sale = (userId: string, category: string, day: number): TeamProduct => ({ id: `${userId}${category}${day}`, userId, category, quantity: 1, timestamp: new Date(2026, 9, day, 11).toISOString() });
const products = [sale("a", "KIP", 21), sale("a", "KIP", 23), sale("a", "Mobile", 22), sale("b", "KIP", 22), sale("b", "Mobile", 22), sale("b", "Mobile", 23), sale("a", "KIP", 18)];

describe("Gewinnspiel", () => {
  it("findet laufende und geplante Gewinnspiele des Nutzers", () => {
    const list = [base, { ...base, id: "old", endDate: new Date(2026, 9, 1).toISOString() }, { ...base, id: "m", teamId: "x", scope: "mentor" as const, selectedUserIds: ["a"] }];
    expect(contestsForUser(list, { id: "a", teamId: "t1" }, NOW).map((c) => c.id)).toEqual(["c1", "m"]);
    expect(contestsByScope(list).map((g) => g.scope)).toEqual(["team", "mentor"]);
  });

  it("rechnet die Rangliste nach Zielerreichung, Stückzahl bei Gleichstand, ohne Ausgeschlossene", () => {
    const s = contestStandings(base, users, products, NOW);
    expect(s.map((x) => x.id)).toEqual(["b", "a"]);
    expect(s[0]?.progress).toBeCloseTo(62.5);
    expect(s[1]?.goals[0]).toMatchObject({ current: 2, today: 1 });
  });

  it("zählt eigene Gruppen zusammen und findet die eigene Gruppe", () => {
    const groups = { ...base, type: "custom-groups" as const, customGroups: [{ id: "g1", name: "Team Rot", memberIds: ["a", "b"] }] };
    const s = contestStandings(groups, users, products, NOW);
    expect(s[0]).toMatchObject({ id: "g1", memberNames: ["Anna", "Ben"] });
    expect(ownStandingId(groups, "b")).toBe("g1");
  });

  it("zeigt vor dem Start einen Countdown", () => {
    const planned = { ...base, startDate: new Date(2026, 9, 24, 14, 30, 15).toISOString() };
    expect(contestClock(planned, NOW).countdown).toEqual({ days: 1, hours: 2, minutes: 30, seconds: 15 });
    expect(contestClock(base, NOW).started).toBe(true);
  });
});
