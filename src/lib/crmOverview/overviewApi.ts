import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, listOf, messageOf } from "../battle/legacyRequest";
import { demoDelete, demoSales, demoWait } from "./overviewDemoStore";
import { enrichSales, type RawRecord } from "./overviewLogic";
import type { AdminSale } from "./overviewTypes";

/**
 * Verkäufe aller Nutzer über die v1-Admin-Endpunkte (/api/products/admin/all und /api/doors/admin/all,
 * nur für Admins). Im Demo-Modus antwortet der Beispielspeicher im sessionStorage.
 */
export class OverviewError extends Error {}

export async function loadAdminSales(): Promise<AdminSale[]> {
  if (hasDemoSession()) return demoWait().then(demoSales);
  const [products, doors] = await Promise.all([legacyRequest("/products/admin/all"), legacyRequest("/doors/admin/all")]);
  if (!products.success) throw new OverviewError(messageOf(products) || "Verkäufe konnten nicht geladen werden");
  if (!doors.success) throw new OverviewError(messageOf(doors) || "Türen konnten nicht geladen werden");
  return enrichSales(listOf<RawRecord>(products, "products"), listOf<RawRecord>(doors, "doors"));
}

/** Löscht Produkte (v1 DELETE /products/:id) und liefert die Ids, die wirklich weg sind. */
export async function deleteSales(ids: readonly string[]): Promise<string[]> {
  if (hasDemoSession()) return demoWait(250).then(() => demoDelete(ids));
  const results = await Promise.all(ids.map((id) => legacyRequest(`/products/${id}`, json("DELETE")).then((body) => (body.success ? id : null), () => null)));
  return results.filter((id): id is string => id !== null);
}
