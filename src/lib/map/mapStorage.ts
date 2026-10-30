import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest } from "../battle/legacyRequest";
import type { MapArea, MapHouse, TeamMemberOption, VisitStatus } from "./mapTypes";

const HOUSES_KEY = "vf_map_houses_v2";
const AREAS_KEY = "vf_map_areas_v2";

const DEMO_MEMBERS: TeamMemberOption[] = [
  { id: "demo-admin", name: "Demo Admin", role: "Teamleiter" },
  { id: "u-lena", name: "Lena Becker", role: "Berater" },
  { id: "u-max", name: "Max Krüger", role: "Berater" },
  { id: "u-sara", name: "Sara Yilmaz", role: "Mentor" },
];

export function readStoredHouses(): MapHouse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HOUSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MapHouse[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignorieren
  }
  return [];
}

export function writeStoredHouses(houses: MapHouse[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOUSES_KEY, JSON.stringify(houses));
  } catch {
    // ignorieren
  }
}

export function readStoredAreas(): MapArea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AREAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MapArea[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignorieren
  }
  return [];
}

export function writeStoredAreas(areas: MapArea[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AREAS_KEY, JSON.stringify(areas));
  } catch {
    // ignorieren
  }
}

interface RawServerHouse {
  id?: string;
  _id?: string;
  houseNumber?: string;
  addressId?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  type?: "EFH" | "MFH";
  latitude?: number;
  longitude?: number;
  status?: VisitStatus;
}

interface RawServerArea {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  manager_id?: string | { _id?: string; id?: string; name?: string };
  geojson?: { type: "Polygon"; coordinates: [number, number][][] };
}

export async function fetchMapHousesFromServer(): Promise<MapHouse[]> {
  const local = readStoredHouses();
  if (hasDemoSession()) return local;
  const res = await legacyRequest("/houses");
  const list = Array.isArray(res.houses) ? res.houses : Array.isArray(res.data) ? res.data : [];
  const byId = new Map<string, MapHouse>();
  for (const h of local) byId.set(h.id, h);
  for (const raw of list as RawServerHouse[]) {
    const id = raw.id || raw._id;
    if (!id || !Number.isFinite(raw.latitude) || !Number.isFinite(raw.longitude)) continue;
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        street: raw.street ?? "",
        houseNumber: raw.houseNumber ?? "",
        zipCode: raw.zipCode ?? "",
        city: raw.city ?? "",
        type: raw.type === "MFH" ? "MFH" : "EFH",
        latitude: Number(raw.latitude),
        longitude: Number(raw.longitude),
        status: raw.status ?? "offen",
        addressId: raw.addressId,
        doors: [],
      });
    }
  }
  return [...byId.values()];
}

export async function fetchMapAreasFromServer(): Promise<MapArea[]> {
  const local = readStoredAreas();
  if (hasDemoSession()) return local;
  const res = await legacyRequest("/areas");
  const list = Array.isArray(res.data) ? res.data : [];
  const byId = new Map<string, MapArea>();
  for (const a of local) byId.set(a.id, a);
  for (const raw of list as RawServerArea[]) {
    const id = raw.id || raw._id;
    if (!id || !raw.geojson || raw.geojson.type !== "Polygon") continue;
    const mgr = raw.manager_id;
    const managerId = typeof mgr === "object" && mgr ? mgr._id || mgr.id : mgr;
    const managerName = typeof mgr === "object" && mgr ? mgr.name : undefined;
    byId.set(id, {
      id,
      name: raw.name ?? "Revier",
      description: raw.description,
      managerId,
      managerName,
      geojson: raw.geojson,
    });
  }
  return [...byId.values()];
}

export async function fetchMapTeamMembers(): Promise<TeamMemberOption[]> {
  if (hasDemoSession()) return DEMO_MEMBERS;
  const res = await legacyRequest("/auth/team-members");
  const list = Array.isArray(res.users) ? res.users : Array.isArray(res.data) ? res.data : [];
  if (list.length === 0) return DEMO_MEMBERS;
  return (list as { id?: string; _id?: string; name?: string; displayName?: string; role?: string }[]).map((m) => ({
    id: m.id || m._id || "",
    name: m.name || m.displayName || "Berater",
    role: m.role || "Berater",
  }));
}

export async function saveAreaToServer(area: MapArea, isEditing: boolean): Promise<MapArea> {
  if (!hasDemoSession()) {
    const path = isEditing ? `/areas/${area.id}` : "/areas";
    await legacyRequest(
      path,
      json(isEditing ? "PUT" : "POST", {
        name: area.name,
        description: area.description,
        postal_codes: [],
        manager_id: area.managerId,
        team_ids: [],
        is_active: true,
        geojson: area.geojson,
      }),
    );
  }
  return area;
}
