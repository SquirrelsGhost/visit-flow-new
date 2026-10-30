import { eur } from "./eur";
import { canDowngrade, currentTariff } from "./telcoNeu";
import type { TelcoQuote } from "./telcoQuote";
import type { TelcoMeta, TelcoState } from "./telcoTypes";
import { hasTariff, isCable } from "./telcoTypes";

/** Anzeigename des Internet-Tarifs ("Giga Zuhause 1000", "Glasfaser 500"). */
export function internetName(s: TelcoState, meta: TelcoMeta): string | undefined {
  if (!hasTariff(s)) return undefined;
  const name = String(currentTariff(s, meta)?.name ?? "");
  const lower = name.toLowerCase();
  if (isCable(s.portfolio)) return lower.includes("zuhause") ? name : `Giga Zuhause ${name}`;
  if (s.portfolio === "glasfaser") return lower.includes("glasfaser") ? name : `Glasfaser ${name}`;
  return name;
}

/** Monatspreis-Zeilen des Angebotstexts (v1 monthsLines). */
export function monthsLines(meta: TelcoMeta, q: TelcoQuote): string[] {
  const p = q.prices;
  const line = (label: string, value: number) => `- ${label}: ${eur(value)}/Monat`;
  const hasEarly = meta.months6 + meta.months79 > 0;
  if (q.showFlatAllMonths) return [line("1–24. Monat", p.price1to6)];
  const early = () => [
    ...(meta.months6 > 0 ? [line(meta.label6 || "1–6. Monat", p.price1to6)] : []),
    ...(meta.months79 > 0 ? [line(meta.label79 || "7–9. Monat", p.price7to9)] : []),
  ];
  if (q.loyaltyActive) {
    const head = !q.showSplitEarly && hasEarly ? [line("1–9. Monat", p.price1to6)] : early();
    const tail = meta.monthsB > 0 ? [line("10–12. Monat", p.price10to12), line("13–36. Monat", p.price13to24)] : [];
    return [...head, ...tail];
  }
  const labelB = meta.labelB || "10–24. Monat";
  if (hasEarly && !q.showSplitEarly) {
    return [line("1–9. Monat", p.price1to6), ...(meta.monthsB > 0 ? [line(labelB, p.price10to24)] : [])];
  }
  const lines = meta.months6 > 0 ? [line(meta.label6 || "1–6. Monat", p.price1to6)] : [];
  if (meta.months79 > 0) {
    if (q.merge79AndB) return [...lines, line("7–24. Monat", p.price10to24)];
    lines.push(line(meta.label79 || "7–9. Monat", p.price7to9));
  }
  if (meta.monthsB > 0) lines.push(line(labelB, p.price10to24));
  return lines;
}

/** Produktzeilen des Angebotstexts (v1 detailLines). */
export function detailLines(s: TelcoState, meta: TelcoMeta, q: TelcoQuote): string[] {
  const lines: string[] = [];
  const internet = internetName(s, meta);
  if (internet) lines.push(`- Internet: ${internet.includes("1000") ? `${internet} – bis zu 1000 Mbit/s (Gigabit)` : internet}`);
  const festnetz =
    s.festnetzId === "tel_flat"
      ? "Telefonflatrate ins Festnetz und alle deutschen Mobilfunknetze von nun an kostenlos!(Sonderrufnummern ausgeschlossen)"
      : s.festnetzId === "nat_mobil_flat"
        ? "Nationale Mobilflat – deutschlandweit ins Mobilfunknetz inklusive"
        : q.add.festnetz?.name;
  if (festnetz) lines.push(`- Festnetz: ${festnetz}`);
  if (s.routerId !== "none" && q.add.router) {
    const router = s.routerId === "fb6670_miete" ? "FRITZ!Box 6670 – Wi‑Fi 7 (neueste WLAN‑Technologie)" : q.add.router.name.replace(/\s*\((?:Miete|Kauf)\)\s*/i, "");
    lines.push(`- Router: ${router}`);
  }
  if (s.gigaId !== "none" && q.add.giga) {
    const adds = [
      ...(s.gigaMultiroomCount > 0 ? [`Multiroom x${s.gigaMultiroomCount}`] : []),
      ...(s.gigaAddPremium && !q.add.premiumIncluded ? ["Premium"] : []),
      ...(s.gigaAddNetflix && !q.add.netflixIncluded ? ["Netflix"] : []),
    ];
    const tv = s.gigaId === "tv_connect_standard" ? `${q.add.giga.name} – alle frei empfangbaren Sender inklusive` : q.add.giga.name;
    lines.push(`- TV: ${tv}${adds.length ? ` (+${adds.join(", ")})` : ""}`);
    if (s.gigaId.startsWith("gtv_") && q.add.tvAutoDiscount > 0) lines.push("  • TV Connect Standard – alle frei empfangbaren Sender inklusive");
    else if (q.add.tvAutoDiscount > 0) lines.push(`  • ${eur(12.99)}/Monat`, `  • -${eur(12.99)}/Monat dauerhafte Gutschrift`);
  }
  if (s.mobileId !== "none" && q.add.mobile) lines.push(`- Mobile: ${q.add.mobile.name}${s.mobileUnlimited ? " (Unlimited)" : ""}`);
  return lines;
}

/** Der komplette Angebotstext zum Kopieren und Teilen (v1 prettyOfferText). */
export function offerText(s: TelcoState, meta: TelcoMeta, q: TelcoQuote): string {
  const m = q.monthsLabelShort;
  return [
    `Angebot – ${meta.title}`,
    "Alt",
    `- aktuell: ${eur(q.altMonthly)}/Monat`,
    `- ${m} gesamt: ${eur(q.altTotal)}`,
    "Neu",
    ...detailLines(s, meta, q),
    "Monatspreise",
    ...monthsLines(meta, q),
    ...(canDowngrade(s) && s.downgradeId !== "none"
      ? ["- Hinweis: Der Wechsel bis zum 9. Monat erfolgt nicht automatisch. Bitte bis zum 9. Monat einmalig beauftragen (über uns oder online)."]
      : []),
    "Einmalig",
    `- Kosten: ${eur(q.oneTimeCosts)}`,
    ...(q.credit > 0 ? [`- Gutschrift: -${eur(q.credit)}`] : []),
    `- Summe: ${eur(q.oneTimeCosts - q.credit)}`,
    "Gesamt",
    `- Ø Neu (${m}): ${eur(q.neuAvg)}/Monat`,
    `- ${m} gesamt: ${eur(q.neuTotal)}`,
    `- Ersparnis (${m}): ${eur(q.ersparnis)}`,
    "Alle Preise inkl. MwSt.",
  ].join("\n");
}
