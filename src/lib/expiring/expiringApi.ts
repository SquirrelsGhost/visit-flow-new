import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest, listOf, messageOf } from "../battle/legacyRequest";
import { listIn, toUser } from "../overview/teamApi";
import { demoAdvisors, demoAssign, demoExpiring, demoWait } from "./expiringDemoStore";
import { toContracts, type RawContract } from "./expiringLogic";
import { DAYS_WINDOW, type Advisor, type ExpiringContract } from "./expiringTypes";

/**
 * Auslaufende Verträge über die v1-Admin-Endpunkte (nur Admins): GET /products/admin/expiring,
 * Berater aus GET /admin/users, Zuweisen über PATCH /products/:id/assign-advisor.
 * Im Demo-Modus antwortet der Beispielspeicher im sessionStorage.
 */
export async function loadExpiring(): Promise<ExpiringContract[]> {
  if (hasDemoSession()) return demoWait().then(() => demoExpiring());
  const body = await legacyRequest(`/products/admin/expiring?days=${DAYS_WINDOW}`);
  if (!body.success) throw new Error(messageOf(body) || "Auslaufende Verträge konnten nicht geladen werden");
  return toContracts(listOf<RawContract>(body, "contracts"));
}

/** Aktive, nicht gesperrte Nutzer wie v1 AssignAdvisorDialog (users.filter(isActive !== false)). */
export async function loadAdvisors(): Promise<Advisor[]> {
  if (hasDemoSession()) return demoWait(200).then(demoAdvisors);
  const body = await legacyRequest("/admin/users");
  if (!body.success) throw new Error(messageOf(body) || "Berater konnten nicht geladen werden");
  return listIn(body, "users", "data")
    .map(toUser)
    .filter((u) => u.isActive !== false && !u.isBlocked)
    .map((u) => ({ id: u.id, name: u.name, role: u.role }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}

/** Lead einem Berater zuweisen oder mit null die Zuweisung aufheben. */
export async function assignAdvisor(contractId: string, advisor: Advisor | null): Promise<void> {
  if (hasDemoSession()) return demoWait(300).then(() => demoAssign(contractId, advisor));
  const body = await legacyRequest(`/products/${contractId}/assign-advisor`, json("PATCH", { advisorId: advisor?.id ?? null }));
  if (!body.success) throw new Error(messageOf(body) || "Zuweisung fehlgeschlagen");
}
