import { ROUTERS_CABLE, ROUTERS_FIBER_DSL } from "./telcoCatalog";
import { GIGATV_BESTAND, GIGATV_NEU } from "./telcoTvCatalog";
import { periodPrices } from "./tariffConvert";
import type { Tariff } from "./tariffTypes";
import type { GigaTvOption, Portfolio, RouterOption } from "./telcoTypes";

const matches = (t: Tariff, o: { id: string; name: string }) => t.id === o.id || t.name === o.name;

/**
 * TV-Auswahl (v1 GIGATV_OPTIONS): Ohne Tarife aus der Verwaltung gelten die Standardoptionen.
 * Sonst nur Optionen, die es dort gibt, mit deren Preisen, plus eigene TV-Tarife der Verwaltung.
 * Für "Bereits Giga" kommen nur Giga-TV-Upsell-Tarife aus der Bestandsliste dazu.
 */
export function buildGigaTvOptions(isBestand: boolean, source: Tariff[]): GigaTvOption[] {
  const base = isBestand ? GIGATV_BESTAND : GIGATV_NEU;
  if (source.length === 0) return base;
  const result: GigaTvOption[] = base
    .filter((opt) => opt.id === "none" || source.some((t) => matches(t, opt)))
    .map((opt) => {
      const db = source.find((t) => matches(t, opt));
      if (!db?.periods?.length) return opt;
      const { a, b } = periodPrices(db);
      return { ...opt, id: db.id, a, b, oneTime: db.oneTimeCosts?.setup ?? opt.oneTime };
    });
  for (const t of source) {
    const name = t.name.toLowerCase();
    if (isBestand && (!name.includes("giga tv") || !name.includes("upsell"))) continue;
    if (result.some((r) => matches(t, r))) continue;
    const { a, b } = periodPrices(t);
    const isKasLike = ["connect", "app", "basic", "zuhause"].some((word) => name.includes(word));
    result.push({
      id: t.id,
      name: t.name,
      a,
      b,
      oneTime: t.oneTimeCosts?.setup ?? 0,
      needsShipping: !t.isKAS && !isKasLike,
      includesPremium: name.includes("premium"),
      includesNetflix: name.includes("netflix"),
    });
  }
  return result;
}

/** Router-Auswahl (v1 routerOptions): Kabel- oder Glasfaser/DSL-Liste, abgeglichen mit der Verwaltung. */
export function buildRouterOptions(portfolio: Portfolio, source: Tariff[]): RouterOption[] {
  const base = portfolio === "glasfaser" || portfolio === "dsl" ? ROUTERS_FIBER_DSL : ROUTERS_CABLE;
  if (source.length === 0) return base;
  const result: RouterOption[] = base
    .filter((opt) => opt.id === "none" || source.some((t) => matches(t, opt)))
    .map((opt) => {
      const db = source.find((t) => matches(t, opt));
      if (!db?.periods?.length) return opt;
      return { ...opt, id: db.id, monthly: periodPrices(db).a, oneTime: db.oneTimeCosts?.setup ?? opt.oneTime };
    });
  for (const t of source) {
    if (result.some((r) => matches(t, r))) continue;
    result.push({
      id: t.id,
      name: t.name,
      monthly: periodPrices(t).a,
      oneTime: t.oneTimeCosts?.setup ?? 0,
      ont: t.name.toLowerCase().includes("kauf"),
    });
  }
  return result;
}
