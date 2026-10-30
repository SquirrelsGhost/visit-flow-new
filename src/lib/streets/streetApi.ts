import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest } from "../battle/legacyRequest";
import { idOf, listIn, str, toUser, type Raw } from "../overview/teamApi";
import type { TeamUser } from "../overview/teamTypes";
import { localDay } from "../overview/todayStats";
import { demoDirectory } from "../teams/orgDemoData";
import { demoPendingDoors, demoStreetData } from "./streetDemoData";
import { applyDemoChanges, demoAssign, demoDelete, demoPatch, demoResolve, openDemoPending } from "./streetDemoStore";
import type { AddressPatch, BatchResult, PendingDoor, RawDoor, RawProduct, StreetData, StreetDateFilter, StreetView } from "./streetTypes";

/** Personen mit eigener Gruppe des Strukturleiters (v1 strukturleiterGroupName). */
export interface StreetPeople {
  users: TeamUser[];
  groupOf: Record<string, string>;
}

/** Demo-Gruppen für die Beispiel-Strukturleiterin Julia Wagner. */
const DEMO_GROUPS: Record<string, string> = { b1: "Düsseldorf", b3: "Düsseldorf", b6: "Düsseldorf", b2: "Neuss" };

/** Admin alle Konten (v1 GET /admin/users), sonst das eigene Team (GET /auth/team-members). */
export async function loadStreetPeople(view: StreetView): Promise<StreetPeople> {
  if (hasDemoSession()) return { users: demoDirectory().users, groupOf: view === "struktur" ? DEMO_GROUPS : {} };
  const body = await legacyRequest(view === "admin" ? "/admin/users" : "/auth/team-members");
  if (!body.success) throw new Error("people");
  const raws = listIn(body, "users", "data");
  const groupOf = Object.fromEntries(raws.flatMap((r) => (typeof r.strukturleiterGroupName === "string" ? [[idOf(r), r.strukturleiterGroupName]] : [])));
  return { users: raws.map(toUser), groupOf };
}

const text = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

const toDoor = (r: Raw): RawDoor => ({
  id: idOf(r),
  street: text(r.street),
  houseNumber: text(r.houseNumber).trim(),
  zipCode: text(r.zipCode),
  city: text(r.city),
  status: text(r.status) || "N/A",
  userId: String(str(r.userId) ?? ""),
  userName: str(r.userName) ?? str(r.memberName),
  customerName: text(r.name) || text(r.customerName),
  timestamp: text(r.timestamp) || text(r.createdAt),
});

const toProduct = (r: Raw): RawProduct => ({
  doorId: text(r.doorId),
  userId: String(str(r.userId) ?? ""),
  category: text(r.category) || text(r.type),
  quantity: Number(r.quantity ?? 1) || 1,
  timestamp: text(r.timestamp) || text(r.createdAt) || text(r.created_at),
  commissionEuro: typeof r.commissionEuro === "number" ? r.commissionEuro : 0,
});

/** Demo: Zeitraum wie der Server (lokale Tage, beide Enden eingeschlossen). */
function inRange(data: StreetData, filter: StreetDateFilter): StreetData {
  if (filter.mode === "all") return data;
  const hit = (iso: string) => {
    const day = localDay(iso);
    return day >= filter.from && day <= filter.to;
  };
  return { doors: data.doors.filter((d) => hit(d.timestamp)), products: data.products.filter((p) => hit(p.timestamp)) };
}

/** Endpunkte je Sicht wie v1: Admin /doors|products/admin/all, Strukturleiter /strukturleiter/*, Mentor das Team. */
function paths(view: StreetView, teamId: string | undefined): [doors: string, products: string] {
  if (view === "admin") return ["/doors/admin/all", "/products/admin/all"];
  if (view === "struktur") return ["/strukturleiter/doors", "/strukturleiter/products"];
  const team = teamId ?? "none";
  return [`/doors/team/${team}`, `/products/team/${team}`];
}

/** Türen und Verkäufe im Zeitraum; "Gesamt" ohne Datum (v1 dateRangeFilter "none"). */
export async function loadStreetData(view: StreetView, filter: StreetDateFilter, teamId?: string): Promise<StreetData> {
  if (hasDemoSession()) return inRange(applyDemoChanges(demoStreetData(demoDirectory().users)), filter);
  const query = filter.mode === "all" ? "" : `?startDate=${filter.from}&endDate=${filter.to}`;
  const [doorsPath, productsPath] = paths(view, teamId);
  const [doorsBody, productsBody] = await Promise.all([legacyRequest(doorsPath + query), legacyRequest(productsPath + query)]);
  if (!doorsBody.success) throw new Error("doors");
  return { doors: listIn(doorsBody, "doors", "data").map(toDoor), products: listIn(productsBody, "products", "data").map(toProduct) };
}

/** Straße einer Person geben (v1 POST /street-assignments); der Server hängt dabei alle Türen der Straße um. */
export async function assignStreet(userId: string, street: { street: string; zipCode: string; city: string }): Promise<string | null> {
  if (hasDemoSession()) {
    demoAssign(street, userId);
    return null;
  }
  const body = await legacyRequest("/street-assignments", json("POST", { userId, ...street }));
  return body.success ? null : (body.error ?? body.message ?? "");
}

async function eachDoor(ids: readonly string[], run: (id: string) => Promise<boolean>): Promise<BatchResult> {
  const results = await Promise.all(ids.map(async (id) => [id, await run(id)] as const));
  return { ok: results.filter(([, ok]) => ok).map(([id]) => id), failed: results.filter(([, ok]) => !ok).length };
}

/** Adresse einer oder mehrerer Türen korrigieren (v1 PUT /doors/:id je Tür). */
export async function updateDoors(ids: readonly string[], patch: AddressPatch): Promise<BatchResult> {
  if (hasDemoSession()) {
    demoPatch(ids, patch);
    return { ok: [...ids], failed: 0 };
  }
  return eachDoor(ids, async (id) => (await legacyRequest(`/doors/${id}`, json("PUT", patch))).success);
}

/** Türen löschen (v1 DELETE /doors/:id, löscht Besuch und Haus mit); "nicht gefunden" zählt wie v1 als erledigt. */
export async function deleteDoors(ids: readonly string[]): Promise<BatchResult> {
  if (hasDemoSession()) {
    demoDelete(ids);
    return { ok: [...ids], failed: 0 };
  }
  return eachDoor(ids, async (id) => {
    const body = await legacyRequest(`/doors/${id}`, json("DELETE"));
    return body.success || /not found|nicht gefunden/i.test(String(body.error ?? body.message ?? ""));
  });
}

/** Warteliste zum Löschen (nur Admin, v1 GET /doors/admin/pending-deletions). */
export async function loadPendingDeletions(): Promise<PendingDoor[]> {
  if (hasDemoSession()) return openDemoPending(demoPendingDoors());
  const body = await legacyRequest("/doors/admin/pending-deletions");
  if (!body.success) throw new Error("pending");
  return listIn(body, "doors").map((r) => ({
    id: idOf(r),
    name: text(r.name),
    street: text(r.street),
    houseNumber: text(r.houseNumber),
    zipCode: text(r.zipCode),
    city: text(r.city),
    status: text(r.status),
    ownerName: text(r.ownerName),
    requestedByName: text(r.requestedByName),
    requestedAt: text(r.requestedAt),
  }));
}

/** Anfrage annehmen (endgültig löschen) oder ablehnen (wiederherstellen), v1 PATCH /doors/admin/:id/resolve-deletion. */
export async function resolveDeletion(id: string, action: "approve" | "reject"): Promise<boolean> {
  if (hasDemoSession()) {
    demoResolve(id);
    return true;
  }
  return (await legacyRequest(`/doors/admin/${id}/resolve-deletion`, json("PATCH", { action }))).success;
}

/** Tagesbericht per Mail (v1 POST /reports/send-daily-report). */
export async function sendStreetReport(payload: unknown): Promise<boolean> {
  if (hasDemoSession()) return true;
  return (await legacyRequest("/reports/send-daily-report", json("POST", payload))).success;
}
