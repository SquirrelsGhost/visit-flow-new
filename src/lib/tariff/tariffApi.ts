import { hasDemoSession } from "../auth/demoSession";
import { demoEnergyTariffs } from "../energy/energyDemoTariffs";
import { legacyRequest } from "../battle/legacyRequest";
import { readPreference, writePreference } from "../preferences";
import type { Tariff, TariffCategory } from "./tariffTypes";

const cacheKey = (category: TariffCategory) => `tariffs_cache_${category}`;

function readCache(category: TariffCategory): Tariff[] {
  try {
    const parsed: unknown = JSON.parse(readPreference(cacheKey(category)) ?? "[]");
    return Array.isArray(parsed) ? (parsed as Tariff[]) : [];
  } catch {
    return [];
  }
}

/**
 * Aktive Tarife einer Kategorie (v1 TariffService.getTariffs → GET /api/tariffs?category=&active=true).
 * Ohne Netz gilt der letzte Stand aus dem Speicher. Im Demo-Modus gibt es keine Tarife aus der
 * Verwaltung, dann greifen wie in v1 die eingebauten Standardtarife. Strom und Gas haben keine
 * eingebauten Tarife, dafür gibt es im Demo-Modus Beispieltarife.
 */
export async function loadTariffs(category: TariffCategory): Promise<Tariff[]> {
  if (hasDemoSession()) return demoEnergyTariffs(category);
  const body = await legacyRequest(`/tariffs?category=${category}&active=true`);
  if (body.success && Array.isArray(body.data)) {
    writePreference(cacheKey(category), JSON.stringify(body.data));
    return body.data as Tariff[];
  }
  return readCache(category);
}
