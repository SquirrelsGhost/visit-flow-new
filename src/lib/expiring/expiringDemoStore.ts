import { demoDirectory } from "../teams/orgDemoData";
import { demoContracts } from "./expiringDemoData";
import { toContracts } from "./expiringLogic";
import type { Advisor, ExpiringContract } from "./expiringTypes";

/** Zuweisungen der Demo merkt sich der Tab (Vertrags-Id → Berater oder null = aufgehoben). */
const KEY = "vf_expiring_demo";

type Assignment = { id: string; name: string; at: string } | null;

function assignments(): Record<string, Assignment> {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}") as Record<string, Assignment>;
  } catch {
    return {};
  }
}

export const demoWait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function demoExpiring(now = new Date()): ExpiringContract[] {
  const changes = assignments();
  return toContracts(demoContracts(now), now).map((c) => {
    if (!(c.id in changes)) return c;
    const a = changes[c.id];
    return { ...c, advisorId: a?.id, advisorName: a?.name, assignedAt: a?.at };
  });
}

export function demoAdvisors(): Advisor[] {
  return demoDirectory()
    .users.filter((u) => u.isActive !== false && !u.isBlocked)
    .map((u) => ({ id: u.id, name: u.name, role: u.role }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function demoAssign(contractId: string, advisor: Advisor | null): void {
  const changes = assignments();
  changes[contractId] = advisor ? { id: advisor.id, name: advisor.name, at: new Date().toISOString() } : null;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(changes));
  } catch {
    // Ohne Speicher gilt die Zuweisung nur bis zum Neuladen.
  }
}

export function resetDemoExpiring(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
