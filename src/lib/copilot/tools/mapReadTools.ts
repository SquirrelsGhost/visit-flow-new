import { coachDoors } from "../../coach/coachDoors";
import { buildCoachProfile } from "../../coach/coachProfile";
import { readStoredHouses } from "../../map/mapStorage";
import type { MapHouse } from "../../map/mapTypes";
import { num, type ToolArgs, type ToolContext } from "./copilotToolTypes";

const DAY_MS = 86_400_000;
const dayStart = (now: number) => new Date(new Date(now).toDateString()).getTime();
const ownHouses = () => readStoredHouses().filter((house) => !house.isTeam);

/** Tag und Woche aus den eigenen Türen; dieselbe Rechnung wie das Coach-Profil. */
export function getToday(ctx: ToolContext) {
  const houses = ownHouses();
  const doors = coachDoors(houses, ctx.vertical, ctx.now);
  const since = (from: number) => doors.filter((d) => d.at >= from);
  const sum = (list: typeof doors) => ({
    doors: list.length,
    met: list.filter((d) => !d.notMet).length,
    sales: list.filter((d) => d.sold).length,
    appointments: list.filter((d) => d.appointment).length,
    products: list.flatMap((d) => d.categories).length,
  });
  const profile = buildCoachProfile(houses, ctx.vertical, ctx.now);
  const window = profile.bestWindow ? `${profile.bestWindow.fromHour}-${profile.bestWindow.toHour} Uhr (${profile.bestWindow.hitRate} % angetroffen)` : null;
  return { today: sum(since(dayStart(ctx.now))), last7Days: sum(since(ctx.now - 7 * DAY_MS)), bestTime: window, streakDays: profile.streakDays };
}

/** Haus noch offen: zuletzt niemand angetroffen oder ein Termin steht aus. */
const isOpen = (house: MapHouse) => house.status === "N/A" || house.status === "Angetroffen → Termin";

/** Offene Chancen je Straße (nur Straßennamen, keine Hausnummern), meiste zuerst. */
export function getOpenDoors(args: ToolArgs, ctx: ToolContext) {
  const limit = Math.min(10, Math.max(1, num(args, "limit") ?? 5));
  const since = ctx.now - 28 * DAY_MS;
  const streets = new Map<string, { street: string; notMet: number; followUps: number; lastVisit: number }>();
  for (const house of ownHouses()) {
    if (!isOpen(house) || (house.updatedAt ?? 0) < since) continue;
    const entry = streets.get(house.street) ?? { street: house.street, notMet: 0, followUps: 0, lastVisit: 0 };
    if (house.status === "N/A") entry.notMet += 1;
    else entry.followUps += 1;
    entry.lastVisit = Math.max(entry.lastVisit, house.updatedAt ?? 0);
    streets.set(house.street, entry);
  }
  const list = [...streets.values()].sort((a, b) => b.notMet + b.followUps - (a.notMet + a.followUps)).slice(0, limit);
  return { streets: list.map((s) => ({ street: s.street, notMet: s.notMet, followUps: s.followUps, daysSinceVisit: Math.floor((ctx.now - s.lastVisit) / DAY_MS) })) };
}

/** Anstehende Termine (Datum, Uhrzeit, Straße), nächster zuerst. */
export function getAppointments(args: ToolArgs, ctx: ToolContext) {
  const days = Math.min(14, Math.max(1, num(args, "days") ?? 7));
  const from = dayStart(ctx.now);
  const until = from + days * DAY_MS;
  const items = ownHouses().flatMap((house) =>
    house.doors
      .filter((door) => door.status === "Angetroffen → Termin" && door.appointmentDate)
      .map((door) => ({ date: door.appointmentDate ?? "", time: door.appointmentTime ?? "", street: house.street, type: door.appointmentType ?? null })),
  );
  const upcoming = items.filter((item) => {
    const at = new Date(`${item.date}T${item.time || "00:00"}`).getTime();
    return at >= from && at < until;
  });
  return { appointments: upcoming.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 15) };
}
