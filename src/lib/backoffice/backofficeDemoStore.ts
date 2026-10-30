import type { OrderStatus } from "../crm/crmTypes";
import { enrichSales } from "../crmOverview/overviewLogic";
import { demoDoors, demoProducts } from "../crmOverview/overviewDemoData";
import type { AdminSale } from "../crmOverview/overviewTypes";

/** Entscheidungen im Demo-Modus merkt sich der Tab, getrennt von der CRM-Übersicht. */
const KEY = "vf_backoffice_demo";

interface DemoState {
  status: Record<string, { status: OrderStatus; reason?: string }>;
  deleted: string[];
}

function read(): DemoState {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(KEY) ?? "null") as DemoState | null;
    return raw && typeof raw === "object" ? { status: raw.status ?? {}, deleted: raw.deleted ?? [] } : { status: {}, deleted: [] };
  } catch {
    return { status: {}, deleted: [] };
  }
}

function write(state: DemoState): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ohne Speicher gilt die Entscheidung nur bis zum Neuladen.
  }
}

export const demoWait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const MARK: Record<OrderStatus, string> = { open: "", completed: "[ABGESCHLOSSEN]", cancelled: "[STORNIERT]" };

export function demoBackofficeSales(now = new Date()): AdminSale[] {
  const { status, deleted } = read();
  const gone = new Set(deleted);
  const products = demoProducts(now)
    .filter((p) => !gone.has(String(p.id)))
    .map((p) => {
      const change = status[String(p.id)];
      if (!change) return p;
      const reason = change.status === "cancelled" && change.reason ? ` Verlustgrund: ${change.reason}` : "";
      return { ...p, notes: `${MARK[change.status]}${reason}`.trim() };
    });
  return enrichSales(products, demoDoors());
}

export function demoSetStatus(ids: readonly string[], next: OrderStatus, reason?: string): string[] {
  const state = read();
  ids.forEach((id) => (state.status[id] = { status: next, reason }));
  write(state);
  return [...ids];
}

export function demoRemove(ids: readonly string[]): string[] {
  const state = read();
  state.deleted = [...new Set([...state.deleted, ...ids])];
  write(state);
  return [...ids];
}

export function resetDemoBackoffice(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
