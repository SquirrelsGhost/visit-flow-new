import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../lib/auth/accessToken";
import { AccessScope } from "../modules/access/AccessScope";
import type { ScopeSource, ScopeUser } from "../modules/access/ScopeSource";

interface Row extends ScopeUser {
  isActive?: boolean;
  strukturleiterId?: string;
  mentorId?: string;
}

function source(rows: Row[], areas: Record<string, string[]> = {}): ScopeSource {
  const active = rows.filter((r) => r.isActive !== false);
  return {
    user: async (id) => rows.find((r) => r.id === id) ?? null,
    activeUsers: async ({ teamIds, strukturleiterId, mentorIds }) =>
      active.filter(
        (r) =>
          (!teamIds || teamIds.includes(r.teamId ?? "")) &&
          (!strukturleiterId || r.strukturleiterId === strukturleiterId) &&
          (!mentorIds || mentorIds.includes(r.mentorId ?? "")),
      ),
    gebietsmanagerTeamIds: async (managerId) => areas[managerId] ?? [],
  };
}

const as = (id: string, role = "berater"): AuthUser => ({ id, email: `${id}@example.de`, role: role as AuthUser["role"] });

const rows: Row[] = [
  { id: "admin", role: "admin" },
  { id: "admin-in-a", role: "admin", teamId: "A" },
  { id: "leiter-a", role: "teamleiter", teamId: "A" },
  { id: "berater-a", role: "berater", teamId: "A" },
  { id: "ex-a", role: "berater", teamId: "A", isActive: false },
  { id: "berater-b", role: "berater", teamId: "B" },
  { id: "gm", role: "gebietsmanager" },
  { id: "sl", role: "strukturleiter" },
  { id: "mentor-c", role: "mentor", teamId: "C", strukturleiterId: "sl" },
  { id: "mentee-c", role: "berater", teamId: "C", mentorId: "mentor-c" },
  { id: "fremd-c", role: "berater", teamId: "D" },
];

describe("AccessScope", () => {
  it("Admin ohne Team sieht alle, Admin mit Team nur dieses Team ohne sich selbst", async () => {
    const scope = new AccessScope(source(rows));
    expect(await scope.accessibleUserIds(as("admin", "admin"))).toBeNull();
    expect(await scope.accessibleUserIds(as("admin-in-a", "admin"))).toEqual(["leiter-a", "berater-a"]);
  });

  it("Teammitglieder sehen ihr Team, aber nichts aus anderen Teams", async () => {
    const denied = vi.fn();
    const scope = new AccessScope(source(rows), denied);
    expect(await scope.canAccessUser(as("leiter-a", "teamleiter"), "berater-a")).toBe(true);
    expect(await scope.canAccessUser(as("berater-a"), "berater-b")).toBe(false);
    expect(await scope.canAccessTeam(as("berater-a"), "B")).toBe(false);
    expect(denied).toHaveBeenCalledWith("USER", "berater-b", expect.objectContaining({ id: "berater-a" }));
    expect(denied).toHaveBeenCalledWith("TEAM", "B", expect.objectContaining({ id: "berater-a" }));
  });

  it("Gebietsmanager sehen nur Teams ihrer Gebiete", async () => {
    const scope = new AccessScope(source(rows, { gm: ["B"] }));
    expect(await scope.canAccessTeam(as("gm", "gebietsmanager"), "B")).toBe(true);
    expect(await scope.canAccessTeam(as("gm", "gebietsmanager"), "A")).toBe(false);
    expect(await scope.accessibleUserIds(as("gm", "gebietsmanager"))).toEqual(["gm", "berater-b"]);
  });

  it("Strukturleiter sehen ihre Struktur und Teams nur, wenn sie ganz darin liegen", async () => {
    const scope = new AccessScope(source(rows));
    const sl = as("sl", "strukturleiter");
    expect(await scope.accessibleUserIds(sl)).toEqual(["sl", "mentor-c", "mentee-c"]);
    expect(await scope.canAccessTeam(sl, "C")).toBe(true);
    expect(await scope.canAccessUser(sl, "fremd-c")).toBe(false);
    expect(await scope.canAccessTeam(sl, "D")).toBe(false);
  });

  it("'none' heißt eigene Mentees und ist immer erlaubt, unbekannte Anfragende nie", async () => {
    const scope = new AccessScope(source(rows));
    expect(await scope.canAccessTeam(as("berater-b"), "none")).toBe(true);
    expect(await scope.canAccessUser(as("geloescht"), "berater-a")).toBe(false);
    expect(await scope.accessibleUserIds(as("geloescht"))).toEqual([]);
  });
});
