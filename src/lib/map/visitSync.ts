import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest } from "../battle/legacyRequest";
import type { MapDoor, MapHouse } from "./mapTypes";

/** Tür-Name, wenn keiner angegeben ist (v1 getFinalDoorName). */
export function defaultDoorName(house: Pick<MapHouse, "type">): string {
  return house.type === "EFH" ? "Haupteingang" : "Wohnung 1";
}

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Ergänzt die v1-Schlüssel (Adresse, Besuch), die der Server zum Wiedererkennen braucht. */
export function withSyncIds(house: MapHouse): MapHouse {
  return { ...house, addressId: house.addressId ?? newId(), visitId: house.visitId ?? newId() };
}

/** Produkte gehen getrennt an /products/bulk, nicht in den Tür-Datensatz. */
function withoutProducts(door: MapDoor): Omit<MapDoor, "products"> {
  const copy = { ...door };
  delete copy.products;
  return copy;
}

/** Die v1-Datensätze für ein Haus: Address → House → Visit → Door(s) → verkaufte Produkte. */
export function buildSyncPayload(house: MapHouse) {
  const h = withSyncIds(house);
  const timestamp = new Date(h.updatedAt ?? Date.now()).toISOString();
  const visitStatus = h.status === "offen" ? "N/A" : h.status;
  const doors: MapDoor[] =
    h.doors.length > 0
      ? h.doors
      : [{ id: newId(), name: h.familyName || defaultDoorName(h), status: visitStatus, comment: h.comment, timestamp }];
  return {
    house: { ...h, doors },
    address: { id: h.addressId!, street: h.street, zipCode: h.zipCode, city: h.city },
    houseRecord: {
      id: h.id,
      addressId: h.addressId!,
      houseNumber: h.houseNumber,
      type: h.type,
      latitude: h.latitude,
      longitude: h.longitude,
    },
    visit: { id: h.visitId!, houseId: h.id, timestamp, status: visitStatus, comment: h.comment ?? "" },
    doors: doors.map((d) => ({
      ...withoutProducts(d),
      visitId: h.visitId!,
      street: h.street,
      houseNumber: h.houseNumber,
      zipCode: h.zipCode,
      city: h.city,
    })),
    products: doors.flatMap((d) => (d.products ?? []).map((p) => ({ ...p, doorId: d.id }))),
  };
}

const ok = (body: { success?: boolean }) => body.success !== false;

/**
 * Speichert ein Haus wie v1 über die Bulk-Endpunkte (Upsert per id, Reihenfolge wichtig).
 * Liefert das Haus mit Schlüsseln und Tür-ids zurück; `syncPending`, wenn der Server nicht erreichbar war.
 */
export async function pushHouseToServer(house: MapHouse): Promise<MapHouse> {
  const payload = buildSyncPayload(house);
  const synced = payload.house;
  if (hasDemoSession()) return { ...synced, syncPending: false };
  try {
    const steps: [string, Record<string, unknown[]>][] = [
      ["/addresses/bulk", { addresses: [payload.address] }],
      ["/houses/bulk", { houses: [payload.houseRecord] }],
      ["/visits/bulk", { visits: [payload.visit] }],
      ["/doors/bulk", { doors: payload.doors }],
    ];
    // Der Server erkennt ein Produkt an Tür, Kategorie, Name und Zeitpunkt wieder, ein zweiter Versuch doppelt also nichts
    if (payload.products.length > 0) steps.push(["/products/bulk", { products: payload.products }]);
    for (const [path, body] of steps) {
      if (!ok(await legacyRequest(path, json("POST", body)))) return { ...synced, syncPending: true };
    }
    return { ...synced, syncPending: false };
  } catch {
    return { ...synced, syncPending: true };
  }
}
