import { HSI_GRADES } from "./simulatorCatalog";
import { mergeOrAdd } from "./simulatorBasket";
import type { SimProduct, SimTariff, TariffsByCategory } from "./simulatorTypes";
import { telcoBonus } from "./telcoBonus";

export interface AutopilotOptions {
  target: number;
  month: number;
  multiplier: number;
  stornoOk: boolean;
}

const MAX_STEPS = 1000;
const squash = (name: string) => name.toLowerCase().replace(/\s+/g, "");
const best = (list: readonly SimTariff[]) => [...list].sort((a, b) => b.commissionEuro - a.commissionEuro)[0];

/**
 * GigaTV Cable ohne App, sonst irgendein GigaTV ohne App, sonst der stärkste TV-Tarif (v1, Schreibweise egal).
 * Nach Namen sortiert wie die v1-Antwort, damit der einfache Tarif vor "inkl. Netflix" kommt.
 */
function pickGigaTv(tv: readonly SimTariff[]): SimTariff | undefined {
  const noApp = [...tv].sort((a, b) => a.name.localeCompare(b.name, "de")).filter((t) => !squash(t.name).includes("app"));
  return noApp.find((t) => squash(t.name).includes("gigatvhomecable") || squash(t.name).includes("gigatvcable")) ?? noApp.find((t) => squash(t.name).includes("gigatv")) ?? best(tv);
}

interface Picks {
  kip?: SimTariff;
  tv?: SimTariff;
  mobile?: SimTariff;
  upsell: SimTariff;
}

function picks(all: TariffsByCategory): Picks {
  const mobile = all.mobil ?? [];
  return {
    kip: best(all["kabel-neu"] ?? []),
    tv: pickGigaTv(all.tv ?? []),
    mobile: mobile.find((t) => /\bxs\b/i.test(t.name)) ?? best(mobile),
    upsell: HSI_GRADES[0]!,
  };
}

function totalFor(p: Picks, kip: number, tv: number, mob: number, upsell: number, o: AutopilotOptions): number {
  const base = kip * (p.kip?.commissionEuro ?? 0) + upsell * p.upsell.commissionEuro + tv * (p.tv?.commissionEuro ?? 0) + mob * (p.mobile?.commissionEuro ?? 0);
  return base * o.multiplier + telcoBonus(o.month, { kip, gigatv: tv, mobile: mob, upsell }, o.stornoOk).total;
}

/**
 * "Ziel-Umsatz Auto-Pilot" aus v1: füllt den Warenkorb, bis Provision plus Bonus das Ziel erreichen.
 * Mischung je vier Verträge: 3 Upsells und 1 KIP, jeder zweite mit GigaTV, jeder vierte mit Mobilfunk.
 */
export function autopilot(all: TariffsByCategory, o: AutopilotOptions): SimProduct[] {
  const p = picks(all);
  if (!(o.target > 0) || !(o.multiplier > 0) || (!p.kip && !p.tv && !p.mobile)) return [];
  let kip = 0;
  let tv = 0;
  let mob = 0;
  let upsell = 0;
  for (let n = 1; n <= MAX_STEPS && totalFor(p, kip, tv, mob, upsell, o) < o.target; n++) {
    if (n % 4 === 0) kip++;
    else upsell++;
    if (n % 2 === 0 && p.tv) tv++;
    if (n % 4 === 0 && p.mobile) mob++;
  }
  let out: SimProduct[] = [];
  if (kip > 0 && p.kip) out = mergeOrAdd(out, "KIP", p.kip.name, p.kip.commissionEuro, kip);
  if (upsell > 0) out = mergeOrAdd(out, "Upsell", p.upsell.name, p.upsell.commissionEuro, upsell);
  if (tv > 0 && p.tv) out = mergeOrAdd(out, "GigaTV", p.tv.name, p.tv.commissionEuro, tv);
  if (mob > 0 && p.mobile) out = mergeOrAdd(out, "Mobile", p.mobile.name, p.mobile.commissionEuro, mob);
  return out;
}

/** Einfacher Auto-Pilot für Strom/Gas: stärkster Tarif, so oft, bis das Ziel steht. */
export function energyAutopilot(all: TariffsByCategory, target: number): SimProduct[] {
  const top = best([...(all.strom ?? []), ...(all.gas ?? [])]);
  if (!top || !(target > 0) || top.commissionEuro <= 0) return [];
  const count = Math.min(MAX_STEPS, Math.ceil(target / top.commissionEuro));
  return mergeOrAdd([], top.category === "gas" ? "Gas" : "Strom", top.name, top.commissionEuro, count);
}
