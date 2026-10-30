import { hasDemoSession } from "../auth/demoSession";
import type { Vertical } from "../battle/battleCategories";
import { legacyRequest } from "../battle/legacyRequest";
import { localDay } from "./todayStats";
import { demoTeam } from "./teamDemoData";
import { withDemoPatches } from "./memberApi";
import type { TeamData, TeamDoor, TeamProduct, TeamUser } from "./teamTypes";

export type Raw = Record<string, unknown> & { _id?: string; id?: string };

export const idOf = (raw: Raw) => String(raw.id ?? raw._id ?? "");
export const str = (value: unknown) => (typeof value === "string" ? value : typeof value === "object" && value && "_id" in value ? String((value as Raw)._id) : undefined);

export function listIn(body: Record<string, unknown>, ...keys: string[]): Raw[] {
  for (const key of keys) if (Array.isArray(body[key])) return body[key] as Raw[];
  return [];
}

export function toUser(raw: Raw): TeamUser {
  return {
    id: idOf(raw),
    name: String(raw.name ?? raw.displayName ?? "Berater"),
    email: str(raw.email),
    role: String(raw.role ?? "berater"),
    teamId: str(raw.teamId),
    strukturleiterId: str(raw.strukturleiterId),
    mentorId: str(raw.mentorId),
    isActive: raw.isActive !== false,
    isBlocked: raw.isBlocked === true,
    battleInactive: raw.battleInactive === true,
    dailyStatus: str(raw.dailyStatus),
    dailyStatusReason: str(raw.dailyStatusReason),
    dailyStatusStartDate: str(raw.dailyStatusStartDate),
    dailyStatusEndDate: str(raw.dailyStatusEndDate),
    dailyStatusUpdatedAt: str(raw.dailyStatusUpdatedAt),
    vodafoneContractStart: str(raw.vodafoneContractStart),
    mentorAssignedAt: str(raw.mentorAssignedAt),
    createdAt: str(raw.createdAt),
    isRegularBerater: raw.isRegularBerater === true,
  };
}

const range = (start: Date, end: Date) => `startDate=${localDay(start)}&endDate=${localDay(end)}`;

/** Verkäufe und Türen eines Teams im Zeitraum (v1 /products/team/:id, /doors/team/:id); ohne Team leer. */
export async function loadTeamActivity(teamId: string | undefined, vertical: Vertical, start: Date, end: Date): Promise<Pick<TeamData, "products" | "doors">> {
  const tomorrow = new Date(end);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [productsBody, doorsBody] = await Promise.all([
    teamId ? legacyRequest(`/products/team/${teamId}?${range(start, tomorrow)}`) : Promise.resolve({ success: false }),
    teamId ? legacyRequest(`/doors/team/${teamId}?${range(start, tomorrow)}`) : Promise.resolve({ success: false }),
  ]);
  const products: TeamProduct[] = listIn(productsBody, "products", "data").map((p) => ({
    id: idOf(p),
    userId: String(str(p.userId) ?? ""),
    category: String(p.category ?? ""),
    quantity: Number(p.quantity ?? 1),
    timestamp: String(p.timestamp ?? p.createdAt ?? ""),
    vertical: str(p.vertical),
    isPointRelevant: p.isPointRelevant === true,
    commissionEuro: typeof p.commissionEuro === "number" ? p.commissionEuro : undefined,
  }));
  const doors: TeamDoor[] = listIn(doorsBody, "doors", "data").map((d) => ({
    id: idOf(d),
    userId: String(str(d.userId) ?? ""),
    status: d.status as TeamDoor["status"],
    timestamp: String(d.timestamp ?? d.createdAt ?? ""),
  }));
  return { products: products.filter((p) => (p.vertical ?? "telco") === vertical), doors };
}

/**
 * Team, Verkäufe und Türen für die Führungs-Reiter und das Gewinnspiel (v1 useTeamProducts, useTeamDoors,
 * auth.users). Im Demo-Modus kommt ein Beispielteam passend zur Sparte.
 */
export async function loadTeamData(teamId: string | undefined, vertical: Vertical, start: Date, end: Date): Promise<TeamData> {
  if (hasDemoSession()) return withDemoPatches(demoTeam(vertical));
  const [usersBody, activity] = await Promise.all([legacyRequest("/auth/team-members"), loadTeamActivity(teamId, vertical, start, end)]);
  return { users: listIn(usersBody, "users", "data").map(toUser), ...activity };
}
