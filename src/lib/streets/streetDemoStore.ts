import type { AddressPatch, PendingDoor, StreetData } from "./streetTypes";

const KEY = "vf_street_demo";

/** Was in der Demo geändert wurde; bleibt im Tab, damit Löschen, Korrigieren und Zuweisen sichtbar bleiben. */
interface DemoChanges {
  deleted: string[];
  patched: Record<string, AddressPatch>;
  /** Straße (PLZ|Straße|Ort) → neue Person, wie v1 die Türen beim Zuweisen umhängt. */
  owners: Record<string, string>;
  resolved: string[];
}

const EMPTY: DemoChanges = { deleted: [], patched: {}, owners: {}, resolved: [] };

function read(): DemoChanges {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<DemoChanges>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(update: (current: DemoChanges) => DemoChanges): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(update(read())));
  } catch {
    // ohne sessionStorage gilt die Änderung nur bis zum nächsten Laden
  }
}

export const streetKey = (a: { zipCode: string; street: string; city: string }) => `${a.zipCode}|${a.street}|${a.city}`;

export function applyDemoChanges(data: StreetData): StreetData {
  const { deleted, patched, owners } = read();
  const gone = new Set(deleted);
  const doors = data.doors
    .filter((d) => !gone.has(d.id))
    .map((d) => ({ ...d, ...patched[d.id] }))
    .map((d) => ({ ...d, userId: owners[streetKey(d)] ?? d.userId }));
  const ownerOf = new Map(doors.map((d) => [d.id, d.userId]));
  return { doors, products: data.products.filter((p) => !gone.has(p.doorId)).map((p) => ({ ...p, userId: ownerOf.get(p.doorId) ?? p.userId })) };
}

export const demoDelete = (ids: readonly string[]) => write((c) => ({ ...c, deleted: [...c.deleted, ...ids] }));
export const demoPatch = (ids: readonly string[], patch: AddressPatch) => write((c) => ({ ...c, patched: { ...c.patched, ...Object.fromEntries(ids.map((id) => [id, patch])) } }));
export const demoAssign = (street: { zipCode: string; street: string; city: string }, userId: string) => write((c) => ({ ...c, owners: { ...c.owners, [streetKey(street)]: userId } }));
export const demoResolve = (id: string) => write((c) => ({ ...c, resolved: [...c.resolved, id] }));
export const openDemoPending = (doors: readonly PendingDoor[]) => {
  const done = new Set(read().resolved);
  return doors.filter((d) => !done.has(d.id));
};
