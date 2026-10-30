import { motion } from "motion/react";
import { formatKm } from "../../lib/logbook/logbookFormat";
import { KIND_ORDER } from "../../lib/logbook/logbookLogic";
import type { KindTotals } from "../../lib/logbook/logbookTypes";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import { KIND_STYLE } from "./logbookStyles";

interface KindSplitProps {
  totals: KindTotals;
  t: LogbookTexts;
}

const GROW = { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 } as const;

/** Anteile Dienst, Arbeitsweg und privat als ein geteilter Balken mit Legende darunter. */
export default function KindSplit({ totals, t }: KindSplitProps) {
  const total = totals.business + totals.commute + totals.private;
  return (
    <div>
      <div className="flex h-2.5 gap-[3px] overflow-hidden rounded-full bg-white/[0.08]" role="img" aria-label={KIND_ORDER.map((k) => `${t.kinds[k]} ${formatKm(totals[k], t)}`).join(", ")}>
        {KIND_ORDER.map((kind) =>
          totals[kind] > 0 ? (
            <motion.span key={kind} className={`h-full rounded-full ${KIND_STYLE[kind].bar}`} initial={{ width: 0 }} animate={{ width: `${(totals[kind] / total) * 100}%` }} transition={GROW} />
          ) : null,
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white/60">
        {KIND_ORDER.map((kind) => (
          <li key={kind} className="flex items-center gap-1.5 tabular-nums">
            <span aria-hidden className={`h-2 w-2 rounded-full ${KIND_STYLE[kind].dot}`} />
            {t.kinds[kind]} <span className="font-semibold text-white/85">{formatKm(totals[kind], t)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
