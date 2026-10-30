import { hasDemoSession } from "../auth/demoSession";
import { json, legacyRequest } from "../battle/legacyRequest";
import { readPreference, writePreference } from "../preferences";
import { DEMO_TARIFFS } from "./simulatorDemo";
import type { SimProduct, SimTariff, TariffsByCategory } from "./simulatorTypes";

const CACHE_KEY = "simulator_tariffs_cache";

interface RawTariff {
  id?: string;
  _id?: string;
  name?: string;
  category?: string;
  commissionEuro?: number;
  bandwidth?: number;
  periods?: { price?: number }[];
}

const toTariff = (raw: RawTariff, category: string, i: number): SimTariff => ({
  id: String(raw.id ?? raw._id ?? `${category}-${i}`),
  name: String(raw.name ?? ""),
  category,
  commissionEuro: Number(raw.commissionEuro) || 0,
  bandwidth: raw.bandwidth,
  price: raw.periods?.[0]?.price,
});

/** Antwort von /simulate/tariffs-grouped in unser Format; Unbrauchbares fällt heraus. */
export function normalizeGrouped(data: unknown): TariffsByCategory {
  if (!data || typeof data !== "object") return {};
  const out: Record<string, SimTariff[]> = {};
  for (const [category, list] of Object.entries(data as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue;
    out[category] = (list as RawTariff[]).map((raw, i) => toTariff(raw, category, i)).filter((t) => t.name);
  }
  return out;
}

function readCache(): TariffsByCategory {
  try {
    return normalizeGrouped(JSON.parse(readPreference(CACHE_KEY) ?? "{}"));
  } catch {
    return {};
  }
}

export interface TariffLoad {
  tariffs: TariffsByCategory;
  demo: boolean;
}

/** Alle aktiven Tarife nach Kategorie (v1 GET /api/simulate/tariffs-grouped). Ohne Netz gilt der letzte Stand. */
export async function loadSimulatorTariffs(): Promise<TariffLoad> {
  if (hasDemoSession()) return { tariffs: DEMO_TARIFFS, demo: true };
  const body = await legacyRequest("/simulate/tariffs-grouped");
  if (body.success && body.data) {
    writePreference(CACHE_KEY, JSON.stringify(body.data));
    return { tariffs: normalizeGrouped(body.data), demo: false };
  }
  return { tariffs: readCache(), demo: false };
}

/**
 * Provision je Stück vom Server (v1 POST /api/simulate/commission). Wie in v1 bleibt der eigene Wert,
 * wenn der Server 0 liefert (z. B. feste HSI-Grades). Im Demo-Modus und ohne Netz bleibt alles, wie es ist.
 */
export async function refineCommissions(products: readonly SimProduct[]): Promise<number[] | null> {
  if (hasDemoSession() || products.length === 0) return null;
  const payload = { products: products.map((p) => ({ category: p.category, type: p.name, quantity: p.quantity })) };
  const body = await legacyRequest("/simulate/commission", json("POST", payload));
  const perProduct = (body.data as { perProduct?: { commission?: number }[] } | undefined)?.perProduct;
  if (!body.success || !Array.isArray(perProduct)) return null;
  return products.map((p, i) => {
    const total = Number(perProduct[i]?.commission) || 0;
    return total > 0 ? total / p.quantity : p.commission;
  });
}
