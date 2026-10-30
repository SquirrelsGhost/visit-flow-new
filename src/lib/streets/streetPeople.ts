import { isActiveMentee } from "../overview/structureLogic";
import type { TeamUser } from "../overview/teamTypes";
import type { StreetView } from "./streetTypes";

const isMentor = (u: TeamUser, roles: readonly string[]) => u.role === "mentor" || roles.includes("mentor");

/**
 * Wen ein Strukturleiter sieht (v1 StrukturleiterStreetListContent teamMemberIds): direkt zugeordnete Leute,
 * dazu die Berater unter den zugeordneten Mentoren und, wenn er selbst Mentor ist, seine eigenen Berater.
 */
export function strukturMemberIds(users: readonly TeamUser[], meId: string, meIsMentor: boolean, extraRoles: (u: TeamUser) => readonly string[] = () => []): string[] {
  const direct = users.filter((u) => u.strukturleiterId === meId);
  const mentors = direct.filter((u) => isMentor(u, extraRoles(u))).map((u) => u.id);
  if (meIsMentor && !mentors.includes(meId)) mentors.push(meId);
  const underMentors = users.filter((u) => u.mentorId && mentors.includes(u.mentorId)).map((u) => u.id);
  return [...new Set([...direct.map((u) => u.id), ...underMentors])];
}

/** Personen im Blick der Sicht: Admin alle, Strukturleiter seine Struktur, Mentor seine aktiven Mentees (v1 isActiveMentee). */
export function peopleInView(view: StreetView, users: readonly TeamUser[], meId: string, meIsMentor: boolean, now = new Date()): TeamUser[] {
  if (view === "admin") return [...users];
  const ids = new Set(view === "struktur" ? strukturMemberIds(users, meId, meIsMentor) : users.filter((u) => isActiveMentee(u, meId, now)).map((u) => u.id));
  return users.filter((u) => ids.has(u.id));
}
