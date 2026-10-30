import type { Vertical } from "../../battle/battleCategories";
import { loadTariffs } from "../../tariff/tariffApi";
import type { Tariff, TariffCategory } from "../../tariff/tariffTypes";
import { FALLBACK_TARIFFS } from "../../tariff/telcoCatalog";
import { str, type ToolArgs, type ToolContext } from "./copilotToolTypes";

const CATEGORIES: Record<Vertical, readonly TariffCategory[]> = {
  telco: ["kabel-neu", "kabel-bestand", "glasfaser", "dsl", "mobil", "tv"],
  energy: ["strom", "gas"],
  solar: [],
};
const MAX_RESULTS = 8;

interface TariffInfo {
  name: string;
  category: string;
  bandwidth?: number;
  prices: { label: string; euro: number }[];
}

const fromTariff = (t: Tariff): TariffInfo => ({ name: t.name, category: t.category, bandwidth: t.bandwidth, prices: t.periods.map((p) => ({ label: p.label || p.months, euro: p.price })) });

/** Eingebaute Standardtarife (v1 FALLBACK_TARIFFS), wenn die Verwaltung nichts liefert. */
function fallback(): TariffInfo[] {
  return Object.entries(FALLBACK_TARIFFS).flatMap(([category, list]) =>
    list.map((t) => {
      const prices = "monthly" in t ? [{ label: "monatlich", euro: t.monthly }] : "first9" in t ? [{ label: "Monat 1-9", euro: t.first9 }, { label: "ab Monat 10", euro: t.after9 }] : [{ label: "Aktionszeit", euro: t.firstA }, { label: "danach", euro: t.afterA }];
      return { name: `${category} ${t.name}`, category, bandwidth: t.bandwidth, prices };
    }),
  );
}

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9äöüß]+/).filter((w) => w.length >= 2);

/** Tarife der Sparte zur Suche: Treffer im Namen, in der Kategorie oder bei der Bandbreite. */
export async function findTariff(args: ToolArgs, ctx: ToolContext) {
  const lists = await Promise.all(CATEGORIES[ctx.vertical].map((c) => loadTariffs(c).catch(() => [] as Tariff[])));
  let all = lists.flat().filter((t) => t.isActive !== false).map(fromTariff);
  if (all.length === 0 && ctx.vertical === "telco") all = fallback();
  const query = words(str(args, "query"));
  const score = (t: TariffInfo) => query.filter((q) => `${t.name} ${t.category} ${t.bandwidth ?? ""}`.toLowerCase().includes(q)).length;
  const hits = all.map((t) => ({ t, s: score(t) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.t);
  return { query: str(args, "query"), exact: hits.length > 0, tariffs: (hits.length > 0 ? hits : all).slice(0, MAX_RESULTS) };
}
