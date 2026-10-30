import { enrichSales } from "./overviewLogic";
import { demoDoors, demoProducts } from "./overviewDemoData";
import type { AdminSale } from "./overviewTypes";

/** Gelöschte Demo-Verkäufe merkt sich der Tab, damit Löschen ein Neuladen übersteht. */
const KEY = "vf_crm_overview_demo";

function deleted(): Set<string> {
  try {
    return new Set(JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export const demoWait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function demoSales(): AdminSale[] {
  const gone = deleted();
  return enrichSales(demoProducts(new Date()).filter((p) => !gone.has(String(p.id))), demoDoors());
}

export function demoDelete(ids: readonly string[]): string[] {
  const gone = deleted();
  ids.forEach((id) => gone.add(id));
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify([...gone]));
  } catch {
    // Ohne Speicher gilt das Löschen nur bis zum Neuladen.
  }
  return [...ids];
}

export function resetDemoOverview(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
