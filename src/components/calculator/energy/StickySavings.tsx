// Leiste gleitet ein, solange das Ergebnis nicht im Bild ist
"use client";

import { ChevronDown, Presentation } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Ergebnis } from "../../../lib/energy/energyCalc";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { energyTexts as t } from "../../../texts/energyTexts";
import AnimatedEuro from "../../ui/AnimatedEuro";
import { cn } from "../../../lib/cn";
import { CALC_PRIMARY } from "../calcGlass";

interface StickySavingsProps {
  show: boolean;
  e: Ergebnis | undefined;
  onZumErgebnis: () => void;
  onTafel: () => void;
}

/** Ersparnis immer im Blick, während man oben noch Werte ändert; ein Tipp springt zum Ergebnis. */
export default function StickySavings({ show, e, onZumErgebnis, onTafel }: StickySavingsProps) {
  return (
    <AnimatePresence>
      {show && e && (
        <motion.div
          className="glass-deep sticky bottom-3 z-20 mt-3 flex items-center gap-2 rounded-[22px] p-2 pl-4 md:mx-auto md:max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={SOFT_SPRING}
        >
          <button type="button" onClick={onZumErgebnis} aria-label={t.zumErgebnis} className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">{t.ersparnis(false)}</span>
              {e.ersparnisJahr1Cent > 0 ? (
                <AnimatedEuro value={e.ersparnisJahr1Cent / 100} className="glass-text-shine block text-xl font-semibold tracking-[-0.02em] tabular-nums" />
              ) : (
                <span className="block text-sm font-bold text-white/80">{t.keinVorteil}</span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/50" />
          </button>
          <button
            type="button"
            onClick={onTafel}
            className={cn(CALC_PRIMARY, "h-11 w-auto shrink-0 whitespace-nowrap rounded-xl px-4 text-xs")}
          >
            <Presentation className="h-4 w-4" /> {t.tafelZeigen}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
