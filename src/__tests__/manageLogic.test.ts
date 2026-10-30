import { describe, expect, it } from "vitest";
import { contestFromDraft, emptyDraft, validateDraft } from "../lib/overview/contestForm";
import { filterMembers, memberStats, strukturGroups, teamPulse } from "../lib/overview/manageLogic";
import { draftOf, orphanedBy, patchFrom } from "../lib/overview/memberDraft";
import { goalLines } from "../lib/overview/teamGoals";
import type { TeamData, TeamUser } from "../lib/overview/teamTypes";

const NOW = new Date("2026-10-23T14:00:00");
const users: TeamUser[] = [
  { id: "sl", name: "Julia", role: "strukturleiter", teamId: "t" },
  { id: "a", name: "Anna", role: "berater", teamId: "t", strukturleiterId: "sl" },
  { id: "b", name: "Ben", role: "berater", teamId: "t", dailyStatus: "sick", dailyStatusUpdatedAt: NOW.toISOString() },
];
const data: TeamData = {
  users,
  products: [
    { id: "1", userId: "a", category: "KIP", quantity: 2, timestamp: "2026-10-23T10:00:00", isPointRelevant: true },
    { id: "2", userId: "a", category: "Mobile", timestamp: "2026-10-02T10:00:00" },
    { id: "3", userId: "sl", category: "KIP", timestamp: "2026-09-30T10:00:00" },
  ],
  doors: [{ id: "d", userId: "a", status: "Angetroffen → Sale", timestamp: "2026-10-23T09:00:00" }],
};

describe("Verwaltung", () => {
  it("zählt heute und den Monat je Mitglied", () => {
    const s = memberStats(data, NOW).get("a")!;
    expect(s).toMatchObject({ salesToday: 2, salesMonth: 3, pointsMonth: 2, doorsToday: 1, conversion: 200 });
    expect(memberStats(data, NOW).get("sl")).toBeUndefined();
  });

  it("gruppiert nach Strukturleiter und findet Abwesende", () => {
    const { groups, unassigned } = strukturGroups(users);
    expect(groups[0]?.members.map((u) => u.id)).toEqual(["a"]);
    expect(unassigned.map((u) => u.id)).toEqual(["b"]);
    const stats = memberStats(data, NOW);
    expect(filterMembers(users, "out", "", stats, NOW).map((u) => u.id)).toEqual(["b"]);
    expect(teamPulse(users, stats, NOW)).toMatchObject({ out: 1, working: 2, salesToday: 2 });
  });

  it("schreibt Krank als entschuldigt und Aktiv ohne Grund", () => {
    const sick = patchFrom(users[1]!, { ...draftOf(users[1]!, NOW), status: "sick", reason: "Arzt" }, NOW);
    expect(sick).toMatchObject({ dailyStatus: "sick", dailyStatusReason: "Arzt", dailyAttendance: "excused" });
    const back = patchFrom(users[2]!, { ...draftOf(users[2]!, NOW), status: "active" }, NOW);
    expect(back).toMatchObject({ dailyStatus: "active", dailyStatusReason: null });
    expect(patchFrom(users[1]!, draftOf(users[1]!, NOW), NOW)).toEqual({});
  });

  it("löst die Gruppe auf, wenn der Strukturleiter die Rolle abgibt", () => {
    const patch = patchFrom(users[0]!, { ...draftOf(users[0]!, NOW), role: "berater" }, NOW);
    expect(orphanedBy(users[0]!, patch, users)).toEqual(["a"]);
  });

  it("prüft und baut ein Gewinnspiel wie v1", () => {
    const draft = emptyDraft("telco", NOW);
    expect(validateDraft(draft)).toMatch(/Namen/);
    const ready = { ...draft, name: "Sprint", targets: { ...draft.targets, KIP: 5 }, prizes: ["Gutschein", " "] };
    expect(validateDraft(ready)).toBeNull();
    const contest = contestFromDraft(ready, "t", "tl", NOW);
    expect(contest).toMatchObject({ goals: [{ category: "KIP", target: 5 }], prizes: [{ rank: 1, prize: "Gutschein" }], status: "active", type: "all" });
  });

  it("misst Monatsziele am Monatsstand", () => {
    expect(goalLines({ KIP: 4, total: 10 }, data.products, "telco", NOW)).toEqual([
      { category: "KIP", current: 2, target: 4 },
      { category: "total", current: 3, target: 10 },
    ]);
  });
});
