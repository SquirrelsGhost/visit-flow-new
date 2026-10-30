// Balken wachsen weich auf ihre Länge
"use client";

import { motion } from "motion/react";
import type { Ergebnis } from "../../../lib/energy/energyCalc";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { energyTexts as t } from "../../../texts/energyTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";

interface CompareBarsProps {
  e: Ergebnis;
}

/** Heute gegen neu im 1. Jahr als zwei Balken: der Unterschied ist auf einen Blick sichtbar. */
export default function CompareBars({ e }: CompareBarsProps) {
  const max = Math.max(e.altJahrCent, e.neuJahr1Cent, 1);
  const zeilen = [
    { label: t.vergleichHeute, cent: e.altJahrCent, balken: "bg-slate-400/70 dark:bg-white/30" },
    { label: t.vergleichNeu, cent: e.neuJahr1Cent, balken: "bg-gradient-to-r from-emerald-300 to-emerald-500 shadow-[0_0_12px_-2px_rgba(16,185,129,0.6)]" },
  ];
  return (
    <div className="space-y-3">
      {zeilen.map((z) => (
        <div key={z.label}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-muted-foreground">{z.label}</span>
            <span className="font-bold tabular-nums">
              <AnimatedEuro value={z.cent / 100} /> <span className="font-normal text-muted-foreground">{t.proJahr}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--glass-track)]">
            <motion.div
              className={`h-full rounded-full ${z.balken}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, (Math.max(0, z.cent) / max) * 100)}%` }}
              transition={SOFT_SPRING}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
