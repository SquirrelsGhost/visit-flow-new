// SIM-Zeilen gleiten beim Hinzufügen/Entfernen
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { AltCosts } from "../../../lib/tariff/telcoTypes";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";
import Field from "./Field";
import MoneyInput from "./MoneyInput";
import SectionCard from "./SectionCard";
import { CALC_FIELD_LABEL, CALC_SMALL_BTN } from "../calcGlass";

interface AltCostSectionProps {
  alt: AltCosts;
  altMonthly: number;
  onAlt: (patch: Partial<AltCosts>) => void;
  onAddSim: () => void;
  onSim: (index: number, value: number) => void;
  onRemoveSim: (index: number) => void;
  onSecretTap: () => void;
}

const SMALL_BTN = CALC_SMALL_BTN;

/** Linke Spalte: heutige Monatskosten des Kunden (Internet, TV, SIMs, Abos, Sonstiges). */
export default function AltCostSection({ alt, altMonthly, onAlt, onAddSim, onSim, onRemoveSim, onSecretTap }: AltCostSectionProps) {
  return (
    <SectionCard tone="red" emoji="📊" title={t.current} badge={<AnimatedEuro value={altMonthly} suffix={t.perMonthShort} />}>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <Field label={t.internetFestnetz} htmlFor="alt-internet" onLabelClick={onSecretTap}>
          <MoneyInput id="alt-internet" value={alt.internetFestnetz} onValue={(v) => onAlt({ internetFestnetz: Number(v) })} />
        </Field>
        <Field label={t.tv} htmlFor="alt-tv">
          <MoneyInput id="alt-tv" value={alt.tv} onValue={(v) => onAlt({ tv: Number(v) })} />
        </Field>
        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className={CALC_FIELD_LABEL}>{t.sims}</span>
            <button type="button" className={SMALL_BTN} onClick={onAddSim}>
              {t.addSim}
            </button>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {alt.sims.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2"
                >
                  <MoneyInput value={value} onValue={(v) => onSim(i, Number(v))} aria-label={`${t.sims} ${i + 1}`} className="flex-1" />
                  <button type="button" className={SMALL_BTN} onClick={() => onRemoveSim(i)} disabled={alt.sims.length <= 1}>
                    {t.remove}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <Field label={t.abos} htmlFor="alt-abos">
          <MoneyInput id="alt-abos" value={alt.abos} onValue={(v) => onAlt({ abos: Number(v) })} />
        </Field>
        <Field label={t.other} htmlFor="alt-other">
          <MoneyInput id="alt-other" value={alt.sonstiges} onValue={(v) => onAlt({ sonstiges: Number(v) })} />
        </Field>
      </div>
    </SectionCard>
  );
}
