import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, listOf, messageOf } from "../battle/legacyRequest";
import { demoDiscard, demoLoad, demoSetStatus, demoWait } from "./crmDemoStore";
import type { SaleRecord } from "./crmTypes";

/**
 * Aufträge über die v1-Endpunkte (/api/products/sales, /api/products/:id). Im Demo-Modus antwortet
 * der Beispielspeicher im sessionStorage.
 */
export class CrmError extends Error {}

export async function loadSales(): Promise<SaleRecord[]> {
  if (hasDemoSession()) return demoWait().then(demoLoad);
  const body = await legacyRequest("/products/sales");
  if (!body.success) throw new CrmError(messageOf(body) || "Aufträge konnten nicht geladen werden");
  return listOf<SaleRecord>(body, "sales");
}

/** Alle Produkte eines Auftrags nacheinander; bricht beim ersten Fehler ab. */
async function each(ids: readonly string[], send: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>, fallback: string) {
  for (const id of ids) {
    const body = await send(id);
    if (!body.success) throw new CrmError(body.message || body.error || fallback);
  }
}

/** Abschließen oder stornieren (v1 PATCH /products/sales/:id/status). Storno zählt zur Quote. */
export async function setStatus(ids: readonly string[], status: "completed" | "cancelled"): Promise<void> {
  if (hasDemoSession()) return demoWait(250).then(() => demoSetStatus(ids, status));
  await each(ids, (id) => legacyRequest(`/products/sales/${id}/status`, json("PATCH", { status })), "Fehler beim Aktualisieren");
}

/** Verwerfen löscht die Produkte und zählt nicht zur Quote (v1 DELETE /products/:id). */
export async function discard(ids: readonly string[]): Promise<void> {
  if (hasDemoSession()) return demoWait(250).then(() => demoDiscard(ids));
  await each(ids, (id) => legacyRequest(`/products/${id}`, json("DELETE")), "Fehler beim Verwerfen");
}
