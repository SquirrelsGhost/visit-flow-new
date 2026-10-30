// Wechsel zwischen leerem Zustand und Ergebnis blendet weich über
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Ref } from "react";
import type { EnergySell } from "../../../hooks/useEnergyPencilSell";
import { offeneSchritte } from "../../../lib/energy/energyPreview";
import { energyTexts as t } from "../../../texts/energyTexts";
import CompareBars from "./CompareBars";
import EnergyActions from "./EnergyActions";
import { CALC_CARD } from "../calcGlass";
import { LABEL } from "./energyStyles";
import ResultEmpty from "./ResultEmpty";
import ResultHero from "./ResultHero";
import SparteSplit from "./SparteSplit";

interface ResultCardProps {
  sell: EnergySell;
  onTafel: () => void;
  onAbschluss: () => void;
  onTeilen: () => void;
  ref?: Ref<HTMLElement>;
}

/** Schritt 3 "Ergebnis": Ersparnis groß, Vergleich als Balken, je Sparte, darunter die Aktionen. */
export default function ResultCard({ sell, onTafel, onAbschluss, onTeilen, ref }: ResultCardProps) {
  const { teile, gesamt, s, actions } = sell;
  return (
    <section ref={ref} aria-label={t.ergebnis} className="scroll-mt-4 space-y-3">
      <span className={`${LABEL} block px-1`}>{t.ergebnis}</span>
      <AnimatePresence mode="wait" initial={false}>
        {gesamt ? (
          <motion.div
            key="ergebnis"
            className="grid gap-4 lg:grid-cols-2 lg:gap-5"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResultHero e={gesamt} />
            <div className="space-y-4">
              <div className={`${CALC_CARD} space-y-4`}>
                <CompareBars e={gesamt} />
                <SparteSplit teile={teile} onSparte={actions.setAktiv} />
              </div>
              <EnergyActions onTafel={onTafel} onAbschluss={onAbschluss} onTeilen={onTeilen} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="leer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <ResultEmpty offen={offeneSchritte(s)} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
