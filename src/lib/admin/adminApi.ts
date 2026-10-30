import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, messageOf, type LegacyBody } from "../battle/legacyRequest";
import { listIn, str, type Raw } from "../overview/teamApi";
import { localDay } from "../overview/todayStats";
import { demoActivityAll, demoFlags, demoRevenue, demoTasks, saveDemoFlags } from "./adminDemoData";
import type { AdminActivity, AdminRevenue, AdminTasks, SystemFlags } from "./adminTypes";

/**
 * Admin-Endpunkte der v1-API, nur lesend bis auf die Systemschalter. Im Demo-Modus antworten Beispieldaten,
 * die Schalter merkt sich der Tab.
 */
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const dataOf = (body: LegacyBody) => (body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {});

/** Verkäufe und Türen aller Nutzer im Zeitraum (v1 GET /admin/products und /admin/doors). */
export async function loadAdminActivity(start: Date, end: Date): Promise<AdminActivity> {
  if (hasDemoSession()) return demoActivityAll();
  const range = `startDate=${localDay(start)}&endDate=${localDay(end)}`;
  const [productsBody, doorsBody] = await Promise.all([legacyRequest(`/admin/products?${range}`), legacyRequest(`/admin/doors?${range}`)]);
  if (!productsBody.success || !doorsBody.success) throw new Error(messageOf(productsBody) || messageOf(doorsBody) || "activity");
  return {
    products: listIn(productsBody, "products").map((p: Raw) => ({
      doorId: String(p.doorId ?? ""),
      userId: String(str(p.userId) ?? ""),
      category: String(p.category ?? ""),
      type: String(p.type ?? ""),
      timestamp: String(p.timestamp ?? p.created_at ?? ""),
      commissionEuro: num(p.commission_euro),
      notes: str(p.notes),
    })),
    doors: listIn(doorsBody, "doors").map((d: Raw) => ({ userId: String(str(d.userId) ?? ""), timestamp: String(d.timestamp ?? d.createdAt ?? ""), status: String(d.status ?? "") })),
  };
}

/** Laufende Abos, Lizenzen und Monatsumsatz (v1 GET /admin/payments/revenue-stats). null = nicht verfügbar. */
export async function loadRevenue(): Promise<AdminRevenue | null> {
  if (hasDemoSession()) return demoRevenue();
  const body = await legacyRequest("/admin/payments/revenue-stats");
  if (!body.success) return null;
  const data = dataOf(body);
  const details = Array.isArray(data.details) ? (data.details as Raw[]) : [];
  return {
    mrr: num(data.monthlyRecurringRevenueEur),
    activeSubscriptions: num(data.totalActiveSubscriptions),
    licenses: details.reduce((sum, d) => sum + num(d.licenseCount), 0),
    breached: details.filter((d) => d.contractBreached === true).length,
    canceled: num(data.totalCanceledSubscriptions),
    lostMrr: num(data.monthlyLostRevenueEur),
  };
}

/** Offene Anfragen; ein Endpunkt, der nicht antwortet, zählt als 0, damit der Rest sichtbar bleibt. */
export async function loadTasks(): Promise<AdminTasks> {
  if (hasDemoSession()) return demoTasks();
  const count = (body: LegacyBody, keep: (raw: Raw) => boolean = () => true) => (Array.isArray(body.data) ? (body.data as Raw[]).filter(keep).length : 0);
  const [whitelist, partners, payments] = await Promise.all([legacyRequest("/whitelist/pending"), legacyRequest("/auth/partner-applications"), legacyRequest("/admin/payments/unresolved")]);
  return { whitelist: count(whitelist), partners: count(partners, (p) => p.partnerStatus === "pending"), payments: count(payments) };
}

const toFlags = (raw: Record<string, unknown>): SystemFlags => ({
  maintenanceMode: raw.maintenanceMode === true,
  allowRegistration: raw.allowRegistration !== false,
  bypassCompanyEmailRequirement: raw.bypassCompanyEmailRequirement === true,
});

/** Systemschalter (v1 GET /admin/system-settings). */
export async function loadSystemFlags(): Promise<SystemFlags | null> {
  if (hasDemoSession()) return demoFlags();
  const body = await legacyRequest("/admin/system-settings");
  if (!body.success) return null;
  return toFlags(body.settings && typeof body.settings === "object" ? (body.settings as Record<string, unknown>) : dataOf(body));
}

/** Einen Schalter setzen (v1 PATCH /admin/system-settings); gilt sofort für alle Nutzer. */
export async function saveSystemFlags(patch: Partial<SystemFlags>): Promise<boolean> {
  if (hasDemoSession()) return saveDemoFlags(patch);
  const body = await legacyRequest("/admin/system-settings", json("PATCH", patch));
  return body.success !== false;
}
