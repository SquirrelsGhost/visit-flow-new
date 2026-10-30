import { DEFAULT_VEHICLE_ID } from "./logbookSchema";
import { currentMonth, isoDay, monthId, shiftMonth } from "./logbookDates";
import type { LogbookData, Trip, TripFields } from "./logbookTypes";

const HOME = "Zuhause, Köln-Nippes";
const AREAS = [
  { to: "Köln-Ehrenfeld: Venloer Str., Subbelrather Str.", km: 9 },
  { to: "Pulheim-Brauweiler: Mathildenstr., Ehrenfriedstr.", km: 17 },
  { to: "Leverkusen-Opladen: Kölner Str., Birkenbergstr.", km: 21 },
  { to: "Bergheim-Zieverich: Am Kreuzweg, Römerstr.", km: 31 },
  { to: "Dormagen-Horrem: Knechtstedener Str.", km: 24 },
  { to: "Köln-Longerich: Paul-Humburg-Str., Rheinkassel", km: 6 },
];
const PURPOSE = "Haustürberatung Glasfaser/Kabel";

/** Kleiner fester Zufall, damit die Demo bei jedem Laden gleich aussieht. */
const seeded = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function trip(f: Omit<TripFields, "vehicleId" | "detour"> & { detour?: string }, n: number, late = false): Trip {
  const created = new Date(`${f.date}T${f.endTime || "20:00"}:00`);
  if (late) created.setDate(created.getDate() + 9);
  return { detour: "", ...f, vehicleId: DEFAULT_VEHICLE_ID, id: `demo-${f.date}-${n}`, driver: "Demo Admin", source: "manual", createdAt: created.toISOString(), revisions: [] };
}

/** Ein Arbeitstag: hin ins Gebiet, zurück nach Hause; mittwochs zuerst ins Büro zum Teammeeting. */
function workday(date: string, day: number, km: number, n: number): Trip[] {
  const area = AREAS[Math.floor(seeded(day) * AREAS.length)]!;
  const extra = Math.round(seeded(day + 7) * 4);
  const out = area.km + extra;
  const doors = 25 + Math.round(seeded(day + 3) * 30);
  const trips: Trip[] = [];
  let at = km;
  if (new Date(`${date}T12:00:00`).getDay() === 3) {
    trips.push(trip({ date, startTime: "08:40", endTime: "09:05", startKm: at, endKm: at + 11, kind: "business", from: HOME, to: "Büro Köln-Deutz", purpose: "Teammeeting und Gebietsplanung", partner: "Team Rhein-Erft" }, n++));
    at += 11;
  }
  trips.push(trip({ date, startTime: "13:10", endTime: "13:40", startKm: at, endKm: at + out, kind: "business", from: at === km ? HOME : "Büro Köln-Deutz", to: area.to, purpose: PURPOSE, partner: `${doors} Haushalte besucht` }, n++));
  at += out;
  trips.push(trip({ date, startTime: "19:30", endTime: "20:05", startKm: at, endKm: at + area.km, kind: "business", from: area.to, to: HOME, purpose: "Rückfahrt nach Haustürberatung", partner: "" }, n++));
  return trips;
}

/** Beispielfahrten für Vormonat (abgeschlossen) und laufenden Monat bis heute, mit einer Lücke und einer unvollständigen Fahrt. */
export function demoLogbook(now = new Date()): LogbookData {
  const start = shiftMonth(currentMonth(now), -1);
  const current = monthId(currentMonth(now));
  const trips: Trip[] = [];
  let km = 48_230 - 3_900;
  const cursor = new Date(start.year, start.month, 1, 12);
  let workdays = 0;
  for (let day = 0; cursor <= now; day++, cursor.setDate(cursor.getDate() + 1)) {
    const date = isoDay(cursor);
    const weekday = cursor.getDay();
    if (weekday === 0 || weekday === 6) {
      if (seeded(day) > 0.3) {
        trips.push(trip({ date, startTime: "11:00", endTime: "11:35", startKm: km, endKm: km + 18 + Math.round(seeded(day + 2) * 40), kind: "private", from: HOME, to: "", purpose: "", partner: "" }, 0));
        km = trips[trips.length - 1]!.endKm;
      }
      continue;
    }
    if (seeded(day + 11) < 0.12 || isoDay(cursor) === isoDay(now)) continue;
    /** Am vierten Arbeitstag des laufenden Monats fehlen 23 km: zeigt Lücke und "Als Privatfahrt nachtragen". */
    if (date.startsWith(current) && ++workdays === 4) km += 23;
    const list = workday(date, day, km, 0);
    trips.push(...list);
    km = list[list.length - 1]!.endKm;
  }
  const recent = trips.filter((t) => t.date.startsWith(current) && t.kind === "business");
  const incomplete = recent[recent.length - 4];
  if (incomplete) incomplete.partner = "";
  if (incomplete) incomplete.purpose = "";
  const late = recent[2];
  if (late) trips[trips.indexOf(late)] = trip(late, 9, true);
  return {
    version: 1,
    vehicles: [{ id: DEFAULT_VEHICLE_ID, name: "VW Golf 8 Variant", plate: "K-VF 2026" }],
    activeVehicleId: DEFAULT_VEHICLE_ID,
    trips,
    locks: { [monthId(start)]: { lockedAt: new Date(start.year, start.month + 1, 2, 9).toISOString(), reopened: [] } },
    importedV1: true,
  };
}
