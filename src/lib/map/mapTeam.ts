import { hasDemoSession } from "../auth/demoSession";
import { legacyRequest } from "../battle/legacyRequest";
import { bestStatus, colorForStatus, type VisitStatus } from "./mapTypes";

/** Ein Haus, das ein Kollege bearbeitet hat (v1 TrackingMap "Team-Transparenz", nur Ansicht). */
export interface TeamHouse {
  id: string;
  lat: number;
  lng: number;
  status: VisitStatus;
  number: string;
  street: string;
  by: string;
  ts: number;
}

/** Live-Position eines Kollegen (v1 /location-tracking/team/:id/current). */
export interface TeamMatePosition {
  userId: string;
  name: string;
  lat: number;
  lng: number;
}

/** Rollen, die Kollegen-Positionen sehen dürfen (der v1-Server antwortet sonst mit 403). */
export const LEADER_ROLES = ["admin", "teamleiter", "strukturleiter", "gebietsmanager"];

/** "Gerade dran", wenn die letzte Bearbeitung jünger als 15 Minuten ist (v1). */
export const RECENT_MS = 15 * 60 * 1000;

export function isRecentEdit(ts: number): boolean {
  return ts > 0 && Date.now() - ts < RECENT_MS;
}

const MATE_PALETTE = ["#e2001a", "#22c55e", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899"];

/** Feste Farbe pro Kollege, damit er auf jedem Gerät gleich aussieht (v1 hashColor). */
export function mateColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return MATE_PALETTE[h % MATE_PALETTE.length] ?? MATE_PALETTE[0]!;
}

interface RawDoorPoint {
  id?: string;
  lat?: number;
  lng?: number;
  status?: VisitStatus;
  houseNumber?: string | number;
  street?: string;
  userId?: string;
  by?: string;
  ts?: string | number;
}

/** Türen der Kollegen zu Häusern zusammenfassen; eigene Türen fallen raus (die zeigt die eigene Ebene). */
export function mergeDoorPoints(points: RawDoorPoint[], ownUserId: string | undefined): TeamHouse[] {
  const byKey = new Map<string, TeamHouse>();
  for (const p of points) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    if (p.userId && ownUserId && String(p.userId) === String(ownUserId)) continue;
    const key = String(p.id || `${p.street} ${p.houseNumber}`);
    const status = p.status || "N/A";
    const ts = p.ts ? new Date(p.ts).getTime() : 0;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, {
        id: key,
        lat: Number(p.lat),
        lng: Number(p.lng),
        status,
        number: String(p.houseNumber ?? ""),
        street: String(p.street ?? ""),
        by: p.by || "Kollege",
        ts,
      });
      continue;
    }
    byKey.set(key, {
      ...prev,
      status: bestStatus([prev.status, status]),
      by: ts > prev.ts ? p.by || prev.by : prev.by,
      ts: Math.max(prev.ts, ts),
    });
  }
  return [...byKey.values()];
}

const DEMO_TEAM: [number, number, VisitStatus, string, string, number][] = [
  [0.0006, 0.0006, "Angetroffen → Termin", "Lena Becker", "12", 4],
  [-0.0006, 0.0007, "Angetroffen → Sale", "Max Krüger", "7a", 40],
  [0.0007, -0.0005, "N/A", "Sara Yilmaz", "3", 180],
  [-0.0008, -0.0008, "Angetroffen → Kein Interesse", "Lena Becker", "21", 900],
];

/** Demo: ein paar Kollegen-Häuser rund um die Kartenmitte, damit man die Ebene sieht. */
function demoTeamHouses(center: { lng: number; lat: number }): TeamHouse[] {
  return DEMO_TEAM.map(([dLng, dLat, status, by, number, minAgo], i) => ({
    id: `demo-team-${i}`,
    lng: center.lng + dLng,
    lat: center.lat + dLat,
    status,
    by,
    number,
    street: "Demostraße",
    ts: Date.now() - minAgo * 60_000,
  }));
}

export async function fetchTeamHouses(
  ownUserId: string | undefined,
  center: { lng: number; lat: number } | null,
): Promise<TeamHouse[]> {
  if (hasDemoSession()) return center ? demoTeamHouses(center) : [];
  const res = await legacyRequest("/doors/points");
  const list = Array.isArray(res.points) ? res.points : Array.isArray(res.data) ? res.data : [];
  return mergeDoorPoints(list as RawDoorPoint[], ownUserId);
}

interface RawPosition {
  userId?: string;
  userName?: string;
  latitude?: number;
  longitude?: number;
}

export async function fetchTeamPositions(
  teamId: string,
  ownUserId: string | undefined,
  center: { lng: number; lat: number } | null,
): Promise<TeamMatePosition[]> {
  if (hasDemoSession()) {
    if (!center) return [];
    return [
      { userId: "u-lena", name: "Lena Becker", lng: center.lng + 0.0003, lat: center.lat + 0.0009 },
      { userId: "u-max", name: "Max Krüger", lng: center.lng - 0.0007, lat: center.lat - 0.0003 },
    ];
  }
  const res = await legacyRequest(`/location-tracking/team/${encodeURIComponent(teamId)}/current`);
  const list = Array.isArray(res.data) ? (res.data as RawPosition[]) : [];
  return list.flatMap((p) =>
    p.userId && p.userId !== ownUserId && typeof p.latitude === "number" && typeof p.longitude === "number"
      ? [{ userId: p.userId, name: p.userName || "Kollege", lat: p.latitude, lng: p.longitude }]
      : [],
  );
}

export function buildTeamHousesGeoJSON(houses: TeamHouse[]) {
  return {
    type: "FeatureCollection" as const,
    features: houses.map((t) => ({
      type: "Feature" as const,
      id: t.id,
      geometry: { type: "Point" as const, coordinates: [t.lng, t.lat] },
      properties: { teamId: t.id, color: colorForStatus(t.status) },
    })),
  };
}
