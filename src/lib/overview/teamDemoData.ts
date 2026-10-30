import { DEMO_ADMIN } from "../auth/demoSession";
import type { Vertical } from "../battle/battleCategories";
import type { VisitStatus } from "../map/mapTypes";
import { productGroupsFor } from "./productGroups";
import type { TeamData, TeamDoor, TeamProduct, TeamUser } from "./teamTypes";

/** Beispielteam der Übersicht; Namen wie im Battle-Demo, dazu Strukturleiter- und Mentor-Zuordnung. */
const PEOPLE: readonly [id: string, name: string, role: string, strukturleiter?: string, mentor?: string][] = [
  ["tl", "Kevin Braun", "teamleiter"],
  ["b4", "Julia Wagner", "strukturleiter"],
  ["b7", "Jonas Richter", "strukturleiter"],
  ["b6", "Aylin Demir", "mentor", "b4"],
  ["b1", "Lukas Berger", "berater", "b4", "b6"],
  ["b2", "Sarah Klein", "berater", "b4"],
  ["b3", "Mehmet Yilmaz", "berater", "b4", "b6"],
  ["b5", "Tim Hoffmann", "berater", "b7", "b6"],
  ["b8", "Lea Schulz", "berater", "b7"],
  ["b9", "Noah Fischer", "berater", "b7"],
  ["b10", "Mia Becker", "berater"],
  ["b11", "Felix Wolf", "berater", "b7"],
];

export const DEMO_TEAM_ID = "demo-team";
const TEAM_ID = DEMO_TEAM_ID;
/** Verkäufe je Person und Tag (Index = Tage zurück); ergibt ein glaubwürdiges, unterschiedlich starkes Team. */
const STRENGTH: Record<string, number> = { b1: 3, b2: 2, b3: 1, b4: 2, b5: 2, b6: 2, b7: 1, b8: 3, b9: 0, b10: 0, b11: 1, tl: 1, "demo-admin": 1 };
const DOOR_PATTERN: readonly VisitStatus[] = ["N/A", "Angetroffen → Kein Interesse", "N/A", "Angetroffen → Termin", "N/A", "Angetroffen → Versorgt", "N/A", "Angetroffen → Kein Interesse"];

function at(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return new Date(Math.min(d.getTime(), Date.now())).toISOString();
}

export function demoTeamUsers(): TeamUser[] {
  const sick = { dailyStatus: "sick", dailyStatusReason: "Erkältet", dailyStatusStartDate: at(0, 0, 0), dailyStatusEndDate: at(-1, 23, 59) };
  return [
    { id: DEMO_ADMIN.id, name: DEMO_ADMIN.name ?? "Demo Admin", email: DEMO_ADMIN.email, role: "admin", teamId: TEAM_ID, isActive: true },
    ...PEOPLE.map(([id, name, role, strukturleiterId, mentorId]) => ({
      id,
      name,
      email: `${name.split(" ")[0]?.toLowerCase()}@demo.local`,
      role,
      teamId: TEAM_ID,
      strukturleiterId,
      mentorId,
      isActive: id !== "b10",
      battleInactive: id === "b11",
      ...(id === "b9" ? sick : {}),
    })),
  ];
}

/** Verkäufe und Türen der letzten 21 Tage, passend zur Sparte. */
export function demoTeam(vertical: Vertical): TeamData {
  const users = demoTeamUsers();
  return { users, ...demoActivity(users, vertical) };
}

/** Beispiel-Verkäufe und -Türen für beliebige Personen; Stärke je Person fest, sonst 1 am Tag. */
export function demoActivity(users: readonly TeamUser[], vertical: Vertical, strength: (id: string) => number = (id) => STRENGTH[id] ?? 1): Pick<TeamData, "products" | "doors"> {
  const groups = productGroupsFor(vertical);
  const products: TeamProduct[] = [];
  const doors: TeamDoor[] = [];
  users.forEach((user, u) => {
    const daily = strength(user.id);
    for (let day = 0; day < 21; day += 1) {
      if ((day + u) % 7 === 6) continue;
      const count = Math.max(0, daily - ((day + u) % 3 === 0 ? 1 : 0));
      for (let k = 0; k < count; k += 1) {
        const category = groups[(u + day + k) % groups.length] ?? groups[0] ?? "KIP";
        products.push({ id: `dp-${user.id}-${day}-${k}`, userId: user.id, category, quantity: 1, timestamp: at(day, 10 + k * 2, (u * 7) % 60), vertical, isPointRelevant: k % 2 === 0 });
      }
      if (day === 0 && daily > 0) {
        for (let k = 0; k < 6 + daily * 4; k += 1) {
          doors.push({ id: `dd-${user.id}-${k}`, userId: user.id, status: k < count ? "Angetroffen → Sale" : (DOOR_PATTERN[(k + u) % DOOR_PATTERN.length] ?? "N/A"), timestamp: at(0, 9, k * 6) });
        }
      }
    }
  });
  return { products, doors };
}
