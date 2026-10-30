import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, messageOf } from "../battle/legacyRequest";
import {
  demoDelay,
  demoDeleteRecord,
  demoHistory,
  demoOpen,
  demoPatchItems,
  demoRecord,
  demoReklamationen,
  demoUpload,
} from "./abrechnungDemoStore";
import type { AbrechnungCategory, AbrechnungItem, AbrechnungRecord, BulkResult, MonthRef, UploadResult } from "./abrechnungTypes";
import { uploadBillingFile } from "./abrechnungUpload";

/**
 * Abrechnungs-Endpunkte der v1-API (/api/abrechnung). Im Demo-Modus antwortet der Beispielspeicher.
 * Für Strom/Gas gibt es serverseitig noch keine Abrechnung; dort liefert die Live-API nichts.
 */
export class AbrechnungError extends Error {}

const fail = (body: { message?: string; error?: string }, fallback: string): never => {
  throw new AbrechnungError(messageOf(body as Parameters<typeof messageOf>[0]) || fallback);
};

export async function loadMonth(category: AbrechnungCategory, ref: MonthRef): Promise<AbrechnungRecord | null> {
  if (hasDemoSession()) return demoDelay().then(() => demoRecord(category, ref));
  if (category === "energy") return null;
  const body = await legacyRequest(`/abrechnung/${ref.month}/${ref.year}?category=${category}`);
  if (!body.success) fail(body, "Abrechnung konnte nicht geladen werden");
  return (body.data as AbrechnungRecord | null) ?? null;
}

export async function loadOpen(category: AbrechnungCategory): Promise<AbrechnungItem[]> {
  if (hasDemoSession()) return demoOpen(category);
  if (category === "energy") return [];
  const body = await legacyRequest(`/abrechnung/unresolved/all?category=${category}`);
  return body.success && Array.isArray(body.data) ? (body.data as AbrechnungItem[]) : [];
}

/** Alle Abrechnungen für den Verlauf. v1 GET / filtert nicht nach Kategorie; ohne Feld gilt "vodafone". */
export async function loadHistory(category: AbrechnungCategory): Promise<AbrechnungRecord[]> {
  if (hasDemoSession()) return demoHistory(category);
  if (category === "energy") return [];
  const body = await legacyRequest("/abrechnung");
  const all = body.success && Array.isArray(body.data) ? (body.data as AbrechnungRecord[]) : [];
  return all.filter((r) => (r.category ?? "vodafone") === category);
}

export async function uploadBilling(category: AbrechnungCategory, ref: MonthRef, file: File | null, total?: number): Promise<UploadResult> {
  if (hasDemoSession()) return demoDelay(900).then(() => demoUpload(category, ref, file?.name ?? null, total));
  return uploadBillingFile(category, ref, file, total);
}

export async function recompare(category: AbrechnungCategory, id: string): Promise<void> {
  if (hasDemoSession()) {
    await demoDelay(700);
    return;
  }
  const body = await legacyRequest(`/abrechnung/${id}/compare`, json("POST"));
  if (!body.success) fail(body, "Fehler beim Abgleich");
}

export async function deleteRecord(category: AbrechnungCategory, id: string): Promise<void> {
  if (hasDemoSession()) return demoDelay().then(() => demoDeleteRecord(category, id));
  const body = await legacyRequest(`/abrechnung/${id}`, json("DELETE"));
  if (!body.success) fail(body, "Fehler beim Löschen");
}

export type ItemAction =
  | { kind: "confirm" }
  | { kind: "reklamation"; reason: string; note: string }
  | { kind: "delete" };

const PATHS: Record<ItemAction["kind"], string> = {
  confirm: "items/confirm/bulk",
  reklamation: "reklamation/bulk",
  delete: "items/delete/bulk",
};

function demoAction(category: AbrechnungCategory, ids: string[], action: ItemAction): void {
  demoPatchItems(category, ids, (item) => {
    if (action.kind === "delete") return null;
    if (action.kind === "confirm") return item.status === "missing_in_system" ? { ...item, status: "matched", amountSystem: item.amountPdf } : item;
    return { ...item, reklamiert: true, reklamationReason: action.reason, reklamationNote: action.note, reklamationDate: new Date().toISOString(), reklamationResolved: false };
  });
}

/** Positionen können aus verschiedenen Monaten stammen: jede Gruppe geht an ihre eigene Abrechnung (v1 runOnItems). */
export async function runOnItems(category: AbrechnungCategory, items: AbrechnungItem[], fallbackRecord: string | undefined, action: ItemAction): Promise<BulkResult> {
  if (hasDemoSession()) {
    await demoDelay(450);
    demoAction(category, items.map((i) => i._id), action);
    return { failed: 0, total: items.length };
  }
  const byRecord = new Map<string, string[]>();
  for (const item of items) {
    const rid = item.recordId || fallbackRecord;
    if (rid) byRecord.set(rid, [...(byRecord.get(rid) ?? []), item._id]);
  }
  const { kind, ...extra } = action;
  let failed = 0;
  for (const [rid, itemIds] of byRecord) {
    const body = await legacyRequest(`/abrechnung/${rid}/${PATHS[kind]}`, json("POST", { itemIds, ...extra }));
    if (!body.success) failed += itemIds.length;
  }
  return { failed, total: items.length };
}

export async function loadReklamationen(category: AbrechnungCategory): Promise<AbrechnungItem[]> {
  if (hasDemoSession()) return demoDelay(250).then(() => demoReklamationen(category));
  if (category === "energy") return [];
  const body = await legacyRequest(`/abrechnung/reklamationen/all?category=${category}`);
  return body.success && Array.isArray(body.data) ? (body.data as AbrechnungItem[]) : [];
}

export async function resolveReklamationen(category: AbrechnungCategory, ids: string[]): Promise<void> {
  if (hasDemoSession()) {
    await demoDelay(400);
    return demoPatchItems(category, ids, (i) => ({ ...i, reklamationResolved: true }));
  }
  const body = await legacyRequest("/abrechnung/reklamationen/resolve/bulk", json("POST", { itemIds: ids }));
  if (!body.success) fail(body, "Fehler beim Erledigen");
}
