import { demoSales } from "./crmDemoData";
import type { SaleRecord } from "./crmTypes";

const KEY = "vf_crm_demo";

function read(): SaleRecord[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SaleRecord[];
  } catch {
    // ohne sessionStorage gelten die Beispieldaten
  }
  return demoSales();
}

function write(sales: SaleRecord[]): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(sales));
  } catch {
    // Änderungen gelten dann nur bis zum Neuladen
  }
}

export const demoWait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoLoad = (): SaleRecord[] => read();

/** Setzt die Statusmarke wie der v1-Server (ersetzt eine vorhandene, sonst vorn angehängt). */
export function markNotes(notes: string | undefined, status: "completed" | "cancelled"): string {
  const mark = status === "completed" ? "[ABGESCHLOSSEN]" : "[STORNIERT]";
  const existing = notes ?? "";
  return /\[(ABGESCHLOSSEN|STORNIERT)\]/.test(existing) ? existing.replace(/\[(ABGESCHLOSSEN|STORNIERT)\]/g, mark) : `${mark} ${existing}`.trim();
}

export function demoSetStatus(ids: readonly string[], status: "completed" | "cancelled"): void {
  write(read().map((s) => (ids.includes(s.id) ? { ...s, notes: markNotes(s.notes, status) } : s)));
}

export function demoDiscard(ids: readonly string[]): void {
  write(read().filter((s) => !ids.includes(s.id)));
}

export function resetDemoCrm(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
