import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { windowShare } from "../../lib/expiring/expiringLogic";
import { ALL, URGENCIES, type ExpiringContract, type Urgency } from "../../lib/expiring/expiringTypes";
import { expiringTexts as t } from "../../texts/expiringTexts";
import { URGENCY_STYLE } from "./expiringStyles";

interface ExpiringTimelineProps {
  contracts: readonly ExpiringContract[];
  window: number;
  counts: Record<Urgency, number>;
  active: Urgency | typeof ALL;
  onPick: (urgency: Urgency | typeof ALL) => void;
}

/** Drei Reihen, damit nahe beieinander liegende Verträge nicht übereinander liegen. */
const LANES = ["top-[22%]", "top-1/2", "top-[78%]"] as const;

/**
 * Die nächsten 90 Tage als Zeitachse auf der Kopfkarte: jeder Vertrag ist ein leuchtender Punkt an seinem
 * Ablauftag, die drei Zonen entsprechen den Dringlichkeiten. Darunter filtern die Zonen auf Tippen.
 */
export default function ExpiringTimeline({ contracts, window, counts, active, onPick }: ExpiringTimelineProps) {
  const ticks = [0, window / 3, (window * 2) / 3, window];
  return (
    <div>
      <div role="img" aria-label={t.timeline} className="relative h-14 overflow-hidden rounded-2xl bg-white/[0.05] ring-1 ring-inset ring-white/10">
        <div aria-hidden className="absolute inset-0 grid grid-cols-3">
          {URGENCIES.map((u) => (
            <span key={u} className={cn("border-l border-white/10 transition-opacity duration-500 first:border-l-0", URGENCY_STYLE[u].zone, active !== ALL && active !== u && "opacity-30")} />
          ))}
        </div>
        {contracts.map((c, i) => (
          <motion.span
            key={c.id}
            aria-hidden
            className={cn("absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/70 dark:ring-black/30", LANES[i % LANES.length], URGENCY_STYLE[c.urgency].dot)}
            style={{ left: `${3 + windowShare(c.daysLeft, window) * 94}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: active === ALL || active === c.urgency ? 1 : 0.25 }}
            transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.3 + windowShare(c.daysLeft, window) * 0.6 }}
          />
        ))}
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between px-0.5 text-[10.5px] font-medium tabular-nums text-white/45">
        {ticks.map((d) => (
          <span key={d}>{d === 0 ? t.today : t.dayMark(Math.round(d))}</span>
        ))}
      </div>
      <div role="radiogroup" aria-label={t.urgencyFilter} className="mt-3 grid grid-cols-3 gap-2">
        {URGENCIES.map((u) => {
          const on = active === u;
          return (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(on ? ALL : u)}
              className={cn(
                "flex min-w-0 flex-col items-start rounded-2xl px-3 py-2.5 text-left ring-1 ring-inset transition-[background-color,box-shadow,transform] duration-300 active:scale-[0.98] motion-reduce:transition-none",
                on ? "bg-white/[0.14] ring-white/30" : "bg-white/[0.05] ring-white/10 hover:bg-white/[0.09]",
              )}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                <span className={cn("h-2 w-2 rounded-full", URGENCY_STYLE[u].dot)} />
                {t.urgency[u]}
              </span>
              <span className="mt-1 text-[22px] font-semibold leading-none tabular-nums text-white">{counts[u]}</span>
              <span className="mt-1 truncate text-[11px] text-white/45">{t.urgencyRange[u]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
