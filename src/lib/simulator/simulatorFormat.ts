import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import { eur } from "../tariff/eur";
import type { LeadResult } from "./leadCommission";
import type { LeadRole, SimProduct } from "./simulatorTypes";

const WHOLE = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/** Ganze Euro ("1.300 €") für Sätze und runde Summen. */
export const euroWhole = (n: number) => WHOLE.format(n);

/** "1 Produkt" / "3 Produkte" (Energie: Verträge). */
export function unitsText(count: number, contracts = false): string {
  const words = contracts ? t.hero.contracts : t.hero.units;
  return count === 1 ? words.one : fill(words.many, { count });
}

/** Text zum Teilen wie v1 copyResult: je Posten eine Zeile, dann Bonus und Gesamt. */
export function basketCopyText(products: readonly SimProduct[], provision: number, bonus: number): string {
  const lines = products.map((p) => `${p.quantity}× ${p.name}: ${eur(p.commission * p.quantity)}`);
  const sums = [`${t.hero.provision}: ${eur(provision)}`];
  if (bonus > 0) sums.push(`${t.hero.bonus}: ${eur(bonus)}`);
  sums.push(`${t.hero.total}: ${eur(provision + bonus)}`);
  return `${t.copyTitle}\n${lines.join("\n")}\n\n${sums.join("\n")}`;
}

/** Lead-Zeile wie v1: "100 Netto-Leads (BERATER) | Summe: 9.000 €". */
export function leadCopyText(role: LeadRole, count: number, result: LeadResult): string {
  const unit = role === "berater" ? t.lead.unitOwn : t.lead.unitTeam;
  return fill(t.lead.copyLine, { count, unit, role: t.lead.roles[role].toUpperCase(), total: euroWhole(result.total) });
}

/** Rechenweg der Lead-Provision als Teile, damit die Oberfläche sie einzeln setzen kann. */
export function leadFormulaParts(result: LeadResult): string[] {
  const f = result.formula;
  if (f.kind === "berater") return [fill(t.lead.formula.berater, { leads: f.leads.toLocaleString("de-DE"), rate: euroWhole(f.rate) })];
  if (f.kind === "partner") return [fill(t.lead.formula.partner, { teamLeads: f.teamLeads.toLocaleString("de-DE"), rate: euroWhole(f.rate) })];
  return [
    `${euroWhole(f.ownTotal)} · ${fill(t.lead.formula.own, { ownLeads: f.ownLeads, ownRate: euroWhole(f.ownRate) })}`,
    `${euroWhole(f.overheadTotal)} · ${fill(t.lead.formula.overhead, { teamLeads: f.teamLeads.toLocaleString("de-DE"), rate: euroWhole(f.overheadRate) })}`,
  ];
}
