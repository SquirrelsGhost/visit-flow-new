import { describe, expect, it } from "vitest";
import type { TeamUser } from "../lib/overview/teamTypes";
import { orgScopeFor } from "../lib/teams/orgScope";
import { branchIds, defaultOpen, matchesFilter, peopleIn, personForest, pruneForest, scopeUsers, teamForest, totalsOf } from "../lib/teams/orgTree";
import type { OrgNode } from "../lib/teams/orgTypes";

const NOW = new Date("2026-10-23T12:00:00");
const u = (id: string, role: string, extra: Partial<TeamUser> = {}): TeamUser => ({ id, name: id.toUpperCase(), role, teamId: "t1", isActive: true, ...extra });

const TEAM: TeamUser[] = [
  u("tl", "teamleiter"),
  u("sl", "strukturleiter"),
  u("m", "mentor", { strukturleiterId: "sl" }),
  u("a", "berater", { strukturleiterId: "sl", mentorId: "m" }),
  u("b", "berater", { strukturleiterId: "sl" }),
  u("c", "berater"),
];

/** Baum als lesbare Zeichenkette: id(kinder). */
const shape = (nodes: readonly OrgNode[]): string => nodes.map((n) => (n.children.length ? `${n.id}(${shape(n.children)})` : n.id)).join(",");

describe("Baum der Struktur", () => {
  it("hängt Teamleiter › Strukturleiter › Mentor › Mentee wie in v1", () => {
    expect(shape(personForest(TEAM, NOW))).toBe("tl(sl(m(a),b),c)");
  });

  it("lässt Mentees aus einer anderen Gruppe in ihrer Gruppe", () => {
    const users = [...TEAM, u("sl2", "strukturleiter"), u("d", "berater", { strukturleiterId: "sl2", mentorId: "m" })];
    expect(shape(personForest(users, NOW))).toBe("tl(sl(m(a),b),sl2(d),c)");
  });

  it("hängt Mentees nach vier Monaten wieder an die Gruppe", () => {
    const users = TEAM.map((x) => (x.id === "a" ? { ...x, vodafoneContractStart: "2026-03-01T00:00:00Z" } : x));
    expect(shape(personForest(users, NOW))).toBe("tl(sl(m,a,b),c)");
  });

  it("bricht Ringe in den Zuordnungen auf", () => {
    const users = [u("tl", "teamleiter"), u("x", "mentor", { mentorId: "y" }), u("y", "mentor", { mentorId: "x" })];
    expect(peopleIn(personForest(users, NOW))).toHaveLength(3);
  });

  it("zeigt Strukturleitern ihre Gruppe und Mentoren ihre Mentees", () => {
    expect(shape(personForest(scopeUsers("group", "sl", TEAM, NOW), NOW))).toBe("sl(m(a),b)");
    expect(shape(personForest(scopeUsers("mentees", "m", TEAM, NOW), NOW))).toBe("m(a)");
  });

  it("baut für Admins Teams als Äste und sammelt Personen ohne Team", () => {
    const users = [...TEAM, u("z", "berater", { teamId: undefined })];
    const forest = teamForest([{ id: "t1", name: "Team Eins" }], users, "Ohne Team", NOW);
    expect(forest.map((n) => n.id)).toEqual(["team:t1", "team:none"]);
    expect(defaultOpen(forest, "t1").has("team:t1")).toBe(true);
    expect(defaultOpen(forest, "t1").has("team:none")).toBe(false);
  });

  it("summiert einen Ast ohne gesperrte Konten", () => {
    const stats = new Map([
      ["a", { doorsToday: 10, salesToday: 2, salesMonth: 20, pointsMonth: 0, conversion: 20 }],
      ["b", { doorsToday: 5, salesToday: 1, salesMonth: 9, pointsMonth: 0, conversion: 20 }],
    ]);
    const users = TEAM.map((x) => (x.id === "b" ? { ...x, isBlocked: true } : x));
    const sl = personForest(users, NOW)[0]!.children[0]!;
    expect(totalsOf(sl, stats, NOW)).toMatchObject({ people: 3, salesToday: 2, salesMonth: 20 });
  });

  it("behält bei der Suche die Vorgesetzten und klappt sie auf", () => {
    const { nodes, open } = pruneForest(personForest(TEAM, NOW), (x) => x.id === "a");
    expect(shape(nodes)).toBe("tl(sl(m(a)))");
    expect([...open].sort()).toEqual(["m", "sl", "tl"]);
    expect(branchIds(nodes)).toEqual(["tl", "sl", "m"]);
  });

  it("findet Personen ohne Gruppe", () => {
    const byId = new Map(TEAM.map((x) => [x.id, x]));
    expect(TEAM.filter((x) => matchesFilter(x, "unassigned", byId, NOW)).map((x) => x.id)).toEqual(["c"]);
  });
});

describe("Blickwinkel nach Rolle", () => {
  const none = () => false;
  it("ordnet jeder Führungsrolle ihren Blick zu", () => {
    expect(orgScopeFor("admin", none)).toBe("all");
    expect(orgScopeFor("teamleiter", none)).toBe("team");
    expect(orgScopeFor("strukturleiter", (r) => r.includes("strukturleiter"))).toBe("group");
    expect(orgScopeFor("berater", (r) => r.includes("mentor"))).toBe("mentees");
    expect(orgScopeFor("berater", none)).toBeNull();
  });
});
