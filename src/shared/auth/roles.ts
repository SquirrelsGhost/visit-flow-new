/**
 * Rollen in visit-flow, von der höchsten zur niedrigsten Stufe.
 * Die Werte entsprechen dem Enum von `users.role` in v1 (server/src/models/User.ts).
 */
export const ROLES = ["admin", "gebietsmanager", "teamleiter", "strukturleiter", "mentor", "berater"] as const;

export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = {
  admin: 6,
  gebietsmanager: 5,
  teamleiter: 4,
  strukturleiter: 3,
  mentor: 2,
  berater: 1,
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** true, wenn `role` mindestens die Stufe von `minimum` hat. */
export function hasRoleAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}
