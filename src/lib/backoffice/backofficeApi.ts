import type { AuthUser } from "@/shared/auth/authSchemas";
import { apiRequest } from "../apiClient";
import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, listOf, messageOf, type LegacyBody } from "../battle/legacyRequest";
import { loadAdminSales } from "../crmOverview/overviewApi";
import { enrichSales, type RawRecord } from "../crmOverview/overviewLogic";
import type { AdminSale } from "../crmOverview/overviewTypes";
import { localDay } from "../overview/todayStats";
import { can } from "../permissions";
import { addonsOf, teamIdOf } from "./backofficeAccess";
import { BACKOFFICE_MONTHS_BACK } from "./backofficeConfig";
import { demoBackofficeSales, demoRemove, demoSetStatus, demoWait } from "./backofficeDemoStore";
import { loadStart } from "./backofficeLogic";

/**
 * Lesen läuft über vorhandene v1-Endpunkte: Teamleiter /products/team/:id und /doors/team/:id (Scope wie Meine Teams,
 * v1 canAccessTeam), Admin /products/admin/all. Schreiben braucht NEUE Endpunkte, weil v1 Status und Löschen nur für
 * eigene Verkäufe erlaubt: PATCH /teamleiter/sales/:id/status {status, reason?} und DELETE /teamleiter/sales/:id
 * (Server prüft Rolle, aktives Add-on und canAccessUser des Verkäufers). Bis dahin antwortet v1 mit 404.
 */
export class BackofficeError extends Error {}

export const SERVER_MISSING = "Die Server-Freigabe für Teamleiter fehlt noch. Im Demo-Modus kannst du alles ausprobieren.";

export async function loadAddons(): Promise<string[]> {
  const response = await apiRequest<unknown>("/subscriptions/current");
  return response.success ? addonsOf(response.data) : [];
}

export async function loadTeamSales(user: AuthUser, now = new Date()): Promise<AdminSale[]> {
  if (hasDemoSession()) return demoWait().then(() => demoBackofficeSales(now));
  if (can(user, "admin:*")) return loadAdminSales();
  const teamId = teamIdOf(user);
  if (!teamId) throw new BackofficeError("Du bist noch keinem Team zugeordnet.");
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const range = `startDate=${localDay(loadStart(now, BACKOFFICE_MONTHS_BACK))}&endDate=${localDay(end)}`;
  const [products, doors] = await Promise.all([legacyRequest(`/products/team/${teamId}?${range}`), legacyRequest(`/doors/team/${teamId}`)]);
  if (!products.success) throw new BackofficeError(messageOf(products) || "Verkäufe konnten nicht geladen werden");
  return enrichSales(listOf<RawRecord>(products, "products"), listOf<RawRecord>(doors, "doors"));
}

/** v1 kennt die Teamleiter-Routen noch nicht: 404 als JSON oder als HTML-Seite (dann scheitert das Lesen der Antwort). */
const missing = (message?: string) => !message || /not found|cannot (patch|delete)|verbindung zum server/i.test(message);

/** Jede Id einzeln; liefert die, die geklappt haben. Fehlt der Endpunkt (404), gibt es eine klare Meldung. */
async function each(ids: readonly string[], send: (id: string) => Promise<LegacyBody>): Promise<string[]> {
  const done: string[] = [];
  for (const id of ids) {
    const body = await send(id).catch((): LegacyBody => ({ success: false }));
    if (body.success) done.push(id);
    else if (done.length === 0) throw new BackofficeError(missing(messageOf(body)) ? SERVER_MISSING : messageOf(body)!);
  }
  return done;
}

export async function setSalesStatus(ids: readonly string[], status: "completed" | "cancelled", reason?: string): Promise<string[]> {
  if (hasDemoSession()) return demoWait(250).then(() => demoSetStatus(ids, status, reason));
  return each(ids, (id) => legacyRequest(`/teamleiter/sales/${id}/status`, json("PATCH", { status, ...(reason ? { reason } : {}) })));
}

export async function deleteTeamSales(ids: readonly string[]): Promise<string[]> {
  if (hasDemoSession()) return demoWait(250).then(() => demoRemove(ids));
  return each(ids, (id) => legacyRequest(`/teamleiter/sales/${id}`, json("DELETE")));
}
