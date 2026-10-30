// Kacheln kommen und gehen mit AnimatePresence
"use client";

import { AnimatePresence } from "motion/react";
import type { TelcoPencilSell } from "../../../hooks/useTelcoPencilSell";
import { pencilSellSummaryTexts as t } from "../../../texts/pencilSellTexts";
import PriceCard from "./PriceCard";

interface PricingCardsProps {
  sell: TelcoPencilSell;
}

const M = "/Monat";

/** Monatspreise je Abschnitt (gleiche Abschnitte werden zusammengefasst), Treuephase und Einmalkosten. */
export default function PricingCards({ sell }: PricingCardsProps) {
  const { state: s, meta, quote: q } = sell;
  const p = q.prices;
  const cards: { key: string; label: string; value: number }[] = [];
  if (q.showFlatAllMonths) {
    cards.push({ key: "all", label: t.allMonths, value: p.price1to6 });
  } else if (q.showSplitEarly) {
    if (meta.label6 && meta.months6 > 0) cards.push({ key: "6", label: meta.label6, value: p.price1to6 });
    if (q.merge79AndB) cards.push({ key: "7b", label: t.months79B, value: p.price10to24 });
    else {
      if (meta.label79 && meta.months79 > 0) cards.push({ key: "79", label: meta.label79, value: p.price7to9 });
      if (meta.monthsB > 0) cards.push({ key: "b", label: meta.labelB, value: p.price10to24 });
    }
  } else {
    if (meta.months6 + meta.months79 > 0) cards.push({ key: "6", label: meta.months79 > 0 ? t.months19 : meta.label6, value: p.price1to6 });
    if (meta.monthsB > 0) cards.push({ key: "b", label: meta.labelB, value: p.price10to24 });
  }
  if (s.loyaltyUnlocked && s.loyaltyTariffId !== "none") {
    cards.push({ key: "loyal", label: t.loyaltyMonths, value: q.loyaltyMonthlyInternet + q.addonsMonthly + q.add.gigaMonthlyBCombo });
  }
  const oneTime = q.oneTimeCosts + q.add.tariffChangeFee - q.credit;
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 md:gap-3">
      <AnimatePresence initial={false} mode="popLayout">
        {cards.map((c) => (
          <PriceCard key={c.key} label={c.label} value={c.value} suffix={M} />
        ))}
        <PriceCard key="once" label={t.oneTime} value={oneTime} />
      </AnimatePresence>
    </div>
  );
}
