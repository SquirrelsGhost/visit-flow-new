import { Award } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BERATER_BONUS_FROM, type LeadResult } from "../../lib/simulator/leadCommission";
import { leadFormulaParts } from "../../lib/simulator/simulatorFormat";
import type { LeadRole } from "../../lib/simulator/simulatorTypes";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";

interface LeadHeroDetailsProps {
  role: LeadRole;
  count: number;
  result: LeadResult;
}

/** Rechenweg unter dem Betrag; beim Berater zusätzlich, ob die 100-Nettos-Regel schon greift. */
export default function LeadHeroDetails({ role, count, result }: LeadHeroDetailsProps) {
  const isBerater = role === "berater";
  return (
    <>
      {leadFormulaParts(result).map((part) => (
        <p key={part} className="tabular-nums">
          {part}
        </p>
      ))}
      <AnimatePresence mode="wait" initial={false}>
        {isBerater && (
          <motion.p
            key={result.bonusActive ? "on" : "off"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={
              result.bonusActive
                ? "mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[12px] font-semibold text-amber-200 ring-1 ring-inset ring-amber-300/25"
                : "pt-1 text-[12px]"
            }
          >
            {result.bonusActive && <Award aria-hidden className="h-3.5 w-3.5" />}
            {result.bonusActive ? t.lead.bonusActive : fill(t.lead.bonusMissing, { count: BERATER_BONUS_FROM - count })}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
