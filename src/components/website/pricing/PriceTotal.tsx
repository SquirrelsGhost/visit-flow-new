// Zahl rollt beim Ändern: braucht den Browser
"use client";

import { AnimatePresence, motion } from "motion/react";
import { websiteSectionTexts } from "../../../texts/websiteSectionTexts";

/** Monatsbetrag des Teams (Lizenzen × Preis), rollt bei jeder Änderung weich nach. */
interface PriceTotalProps {
  team: number;
}

const t = websiteSectionTexts.pricing;
const eur = (n: number) => `${n.toLocaleString("de-DE")} €`;

export default function PriceTotal({ team }: PriceTotalProps) {
  const total = team * t.perLicense;
  return (
    <div className="text-right">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{t.total}</p>
      <div className="relative h-10 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            key={total}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="text-3xl font-bold tabular-nums tracking-tight"
          >
            {eur(total)}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
