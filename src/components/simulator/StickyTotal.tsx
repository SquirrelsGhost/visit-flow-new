import { AnimatePresence, motion } from "motion/react";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import GlassNumber from "../glass/GlassNumber";
import { GLASS_DEEP } from "../glass/glassStyles";

interface StickyTotalProps {
  visible: boolean;
  total: number;
  detail: string;
}

const BAR = `${GLASS_DEEP} pointer-events-auto mx-auto flex max-w-xl items-center justify-between gap-3 rounded-[22px] px-4 py-3 text-white`;

/** Kleine Ergebnisleiste unten, sobald das große Ergebnis aus dem Bild gescrollt ist. */
export default function StickyTotal({ visible, total, detail }: StickyTotalProps) {
  return (
    <div className="pointer-events-none sticky bottom-3 z-20 -mt-2">
      <AnimatePresence>
        {visible && (
          <motion.div
            className={BAR}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={SOFT_SPRING}
          >
            <span className="min-w-0 truncate text-[12px] text-white/70">{detail}</span>
            <span className="flex items-baseline gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{t.hero.total}</span>
              <GlassNumber value={total} kind="euro" from={total} duration={0.6} className="text-lg font-semibold text-emerald-300" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
