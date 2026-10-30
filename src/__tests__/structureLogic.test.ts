import { describe, expect, it } from "vitest";
import { isActiveMentee, peopleOf, periodRange, rankMembers } from "../lib/overview/structureLogic";
import { buildReport } from "../lib/overview/structureReport";
import type { TeamProduct, TeamUser } from "../lib/overview/teamTypes";

const NOW = new Date("2026-10-23T15:00:00"); // Freitag
const users: TeamUser[] = [
  { id: "sl", name: "Julia Wagner", role: "strukturleiter" },
  { id: "a", name: "Anna Roth", role: "berater", strukturleiterId: "sl", mentorId: "m", createdAt: "2026-08-10" },
  { id: "b", name: "Ben Ott", role: "berater", strukturleiterId: "sl", mentorId: "m", createdAt: "2026-05-01" },
  { id: "c", name: "Cem Kaya", role: "berater", strukturleiterId: "sl", isActive: false },
];
const products: TeamProduct[] = [
  { id: "1", userId: "a", category: "KIP", quantity: 2, timestamp: "2026-10-23T10:00:00" },
  { id: "2", userId: "b", category: "KIP", timestamp: "2026-10-22T10:00:00" },
  { id: "3", userId: "b", category: "KIP", timestamp: "2026-10-19T10:00:00" },
];

describe("Struktur", () => {
  it("rechnet Woche ab Montag", () => {
    expect(periodRange("week", NOW).from.getDate()).toBe(19);
    expect(periodRange("week", NOW).to.getDate()).toBe(26);
  });

  it("zeigt nur aktive Gruppenmitglieder und Mentees der ersten vier Monate", () => {
    expect(peopleOf(users, "structure", "sl", NOW).map((u) => u.id)).toEqual(["a", "b"]);
    expect(isActiveMentee(users[1]!, "m", NOW)).toBe(true);
    expect(isActiveMentee(users[2]!, "m", NOW)).toBe(false);
  });

  it("rankt nach Zeitraum und kennt den Vortag", () => {
    const people = peopleOf(users, "structure", "sl", NOW);
    expect(rankMembers(people, products, "day", NOW).map((r) => [r.member.id, r.sales, r.yesterday])).toEqual([["a", 2, 0], ["b", 0, 1]]);
    expect(rankMembers(people, products, "week", NOW)[0]).toMatchObject({ sales: 2 });
  });

  it("baut den Text für die Gruppe wie v1", () => {
    const text = buildReport(rankMembers(peopleOf(users, "structure", "sl", NOW), products, "day", NOW), "day", NOW);
    expect(text).toContain("🥇 1. @AnnaRoth – 2 Abschlüsse");
    expect(text).toContain("🔴 Unter Mindestleistung (0): @BenOtt");
    expect(text).toContain("Ben, Kopf hoch! Gestern lief es mit 1 Abschluss");
    expect(text).not.toContain("€");
  });
});
