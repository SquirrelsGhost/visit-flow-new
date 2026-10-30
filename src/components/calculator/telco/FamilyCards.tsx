// Karten gleiten beim Hinzufügen/Entfernen
"use client";

import { AnimatePresence, motion } from "motion/react";
import { TELCO_FEES } from "../../../lib/tariff/telcoCatalog";
import type { FamilyCardOption } from "../../../lib/tariff/telcoTypes";
import { pencilSellTvTexts as t } from "../../../texts/pencilSellTexts";
import TariffSelect from "./TariffSelect";
import { CALC_FIELD_LABEL, CALC_SMALL_BTN, CALC_TILE } from "../calcGlass";

interface FamilyCardsProps {
  cards: string[];
  options: FamilyCardOption[];
  onChange: (cards: string[]) => void;
}

const MAX = TELCO_FEES.familyCardsMax;
const data = (gb: number) => (gb === 999 ? "Unlimited" : `${gb} GB`);

/** Bis zu vier Family Cards zum GigaMobil-Tarif. */
export default function FamilyCards({ cards, options, onChange }: FamilyCardsProps) {
  const first = options[0]?.id ?? "fc_s";
  return (
    <div className={`${CALC_TILE} space-y-2 p-3.5`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={CALC_FIELD_LABEL}>{t.familyCards}</span>
        <span className="rounded-full bg-[var(--glass-track)] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
          {cards.length}/{MAX}
        </span>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {cards.map((cardId, index) => (
            <motion.div
              key={`${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2"
            >
              <TariffSelect value={cardId} onChange={(id) => onChange(cards.map((c, i) => (i === index ? id : c)))}>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({data(o.dataGb)})
                  </option>
                ))}
              </TariffSelect>
              <button
                type="button"
                aria-label={t.removeFamilyCard}
                onClick={() => onChange(cards.filter((_, i) => i !== index))}
                className={`${CALC_SMALL_BTN} h-12 rounded-2xl text-red-600 dark:text-red-400`}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {cards.length < MAX && (
        <button
          type="button"
          onClick={() => onChange([...cards, first])}
          className={`${CALC_SMALL_BTN} w-full text-red-600 dark:text-red-400`}
        >
          {t.addFamilyCard}
        </button>
      )}
    </div>
  );
}
