// Jede Zeile steigt einzeln auf, der Strich darunter zieht sich durch
"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { cn } from "../../../lib/cn";
import type { Tafel } from "../../../lib/energy/energyTafel";
import { energyTafelTexts as t } from "../../../texts/energyTexts";
import { AKZENT, TAFEL_EASE } from "./tafelStyles";

interface TafelRowsProps {
  tafel: Tafel;
  gezeigt: number;
}

const rein = { initial: { opacity: 0, y: 8, filter: "blur(4px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" } };

/** Die Rechnung Heute gegen Neu, so viele Zeilen wie schon angetippt. */
export default function TafelRows({ tafel, gezeigt }: TafelRowsProps) {
  const akzent = AKZENT[tafel.art];
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 gap-y-3 pt-4">
      <span />
      <span className="text-right text-[11px] font-black uppercase tracking-widest text-white/40">{t.heute}</span>
      <span className={cn("text-right text-[11px] font-black uppercase tracking-widest", akzent)}>{t.neu}</span>
      {tafel.zeilen.slice(0, gezeigt).map((z) => (
        <Fragment key={`${tafel.titel}-${z.label}`}>
          <motion.span {...rein} transition={{ duration: 0.32, ease: TAFEL_EASE }} className={cn("relative text-[15px]", z.summe ? "font-bold" : "text-white/80")}>
            {z.label}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: TAFEL_EASE, delay: 0.05 }}
              className={cn("absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full", z.summe ? "bg-white/60" : "bg-white/20")}
            />
          </motion.span>
          <motion.span
            {...rein}
            transition={{ duration: 0.32, ease: TAFEL_EASE, delay: 0.06 }}
            className={cn("text-right font-mono text-[15px] tabular-nums", z.summe && "font-bold")}
          >
            {z.heute ?? ""}
            {z.heuteHinweis && <span className="block font-sans text-[10px] text-white/40">{z.heuteHinweis}</span>}
          </motion.span>
          <motion.span
            {...rein}
            transition={{ duration: 0.32, ease: TAFEL_EASE, delay: 0.12 }}
            className={cn("text-right font-mono text-[15px] tabular-nums", z.summe && `font-bold ${akzent}`)}
          >
            {z.neu ?? ""}
          </motion.span>
        </Fragment>
      ))}
    </div>
  );
}
