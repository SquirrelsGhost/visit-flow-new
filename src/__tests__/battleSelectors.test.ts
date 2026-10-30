import { describe, expect, it } from "vitest";
import { buildRecap } from "../lib/battle/battleRecap";
import { eligibleMembers, playerGroups, sortMembers } from "../lib/battle/battleSelectors";
import type { ArenaUser, Challenge, Readiness } from "../lib/battle/battleTypes";

const battle = (id: string, a: string, b: string, extra: Partial<Challenge> = {}): Challenge => ({
  id, challengerId: a, challengerName: a, opponentId: b, opponentName: b, status: "active",
  challengerScore: 0, opponentScore: 0, date: "2026-10-22", createdAt: "", expiresAt: "", ...extra,
});

const readiness: Readiness = {
  newcomers: [{ userId: "n1", name: "Neu", month: 1 }, { userId: "me", name: "Ich", month: 2 }],
  experienced: [{ userId: "e1", name: "Erfahren", month: 8 }, { userId: "s1", name: "Krank", month: 6 }],
  sickToday: [{ userId: "s1", name: "Krank", month: 6 }],
  inactive: [{ userId: "i1", name: "Inaktiv", month: null, hasBattleToday: false }],
};
const users: ArenaUser[] = [
  { id: "n1", name: "Neu", role: "berater" },
  { id: "e1", name: "Erfahren", role: "berater" },
  { id: "i1", name: "Inaktiv", role: "berater", battleInactive: true },
  { id: "s1", name: "Krank", role: "berater" },
];
const noStats = () => ({ sales: 0, score: 0, commission: 0 });

describe("eligibleMembers", () => {
  it("lässt mich, Kranke und Inaktive weg und behält die Kategorie", () => {
    const members = eligibleMembers(readiness, users, "me", noStats);
    expect(members.map((m) => [m.userId, m.category])).toEqual([["n1", "newcomer"], ["e1", "experienced"]]);
  });
});

describe("sortMembers", () => {
  it("setzt Leute im Battle nach unten und Siegesserien nach oben", () => {
    const members = eligibleMembers(readiness, users, "me", noStats);
    const sorted = sortMembers(members, [battle("c", "n1", "x")], { e1: { streak: 2, loseStreak: 0 } });
    expect(sorted.map((m) => m.userId)).toEqual(["e1", "n1"]);
  });
});

describe("playerGroups", () => {
  it("teilt in verfügbar, im Battle und nicht verfügbar", () => {
    const groups = playerGroups(users, "", [battle("c", "e1", "x")], readiness);
    expect(groups.available.map((u) => u.id)).toEqual(["n1"]);
    expect(groups.inBattle.map((u) => u.id)).toEqual(["e1"]);
    expect(groups.unavailable.map((u) => u.id).sort()).toEqual(["i1", "s1"]);
  });
});

describe("buildRecap", () => {
  it("nimmt gestern und zählt Sieger und Unentschieden", () => {
    const done = [battle("a", "x", "y", { status: "completed", winnerId: "x" }), battle("b", "i1", "z", { status: "completed" })];
    const recap = buildRecap(done, readiness.inactive, new Date("2026-10-23T10:00:00Z"));
    expect(recap.label).toBe("Gestern");
    expect([recap.wins, recap.draws]).toEqual([1, 1]);
    expect(recap.absent).toEqual([]);
  });
});
