// Säulen wachsen mit motion nacheinander aus dem Boden
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TopEarner } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";
import GlassNumber from "../../glass/GlassNumber";
import { initial } from "../battleStyles";

interface RecapPodiumProps {
  earners: TopEarner[];
}

/** Gold, Silber, Bronze: Ring ums Bild und Säule. Reihenfolge auf dem Podest 2 · 1 · 3. */
const PLACES = [
  { ring: "ring-amber-300 shadow-[0_0_24px_-4px_rgba(251,191,36,0.8)]", pillar: "h-[84px] from-amber-300/45 to-amber-500/5", rank: "text-amber-200", euro: "text-amber-200" },
  { ring: "ring-slate-200/90 shadow-[0_0_18px_-6px_rgba(226,232,240,0.7)]", pillar: "h-[62px] from-slate-200/30 to-slate-300/5", rank: "text-slate-200", euro: "text-white" },
  { ring: "ring-orange-300/90 shadow-[0_0_18px_-6px_rgba(251,146,60,0.7)]", pillar: "h-[46px] from-orange-300/30 to-orange-400/5", rank: "text-orange-200", euro: "text-white" },
] as const;
const ORDER = [1, 0, 2];
const EASE = [0.22, 1, 0.36, 1] as const;

/** Siegertreppchen der Topverdiener mit Bild, Name, Provision und wachsender Säule. */
export default function RecapPodium({ earners }: RecapPodiumProps) {
  const reduce = useReducedMotion();
  return (
    <div className="mt-3 grid grid-cols-3 items-end gap-2">
      {ORDER.map((place) => {
        const e = earners[place];
        if (!e) return <span key={place} />;
        const style = PLACES[place];
        const first = place === 0;
        return (
          <div key={e.userId} className="flex min-w-0 flex-col items-center">
            <span className={cn("flex items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-red-500 to-red-700 font-semibold text-white ring-2", style.ring, first ? "h-14 w-14 text-[20px]" : "h-11 w-11 text-[15px]")}>
              {initial(e.name)}
            </span>
            <span className="mt-2 w-full truncate text-center text-[12.5px] font-semibold text-white/90">{e.name.split(" ")[0]}</span>
            <GlassNumber value={e.totalCommission} kind="euro" duration={1.3} className={cn("mt-0.5 text-[15px] font-semibold", style.euro)} />
            <motion.div
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 + (2 - place) * 0.12 }}
              className={cn("mt-2 flex w-full origin-bottom items-start justify-center rounded-t-2xl bg-gradient-to-b pt-2 ring-1 ring-inset ring-white/10", style.pillar)}
            >
              <span className={cn("text-[18px] font-semibold", style.rank)}>{place + 1}</span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
