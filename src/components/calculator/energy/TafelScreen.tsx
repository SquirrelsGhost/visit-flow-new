// Schritte, Tastatur und Scroll-Sperre der Tafel
"use client";

import { Flame, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useTafelSteps } from "../../../hooks/useTafelSteps";
import { cn } from "../../../lib/cn";
import { tafelnFuer, type TafelTeil } from "../../../lib/energy/energyTafel";
import { energyTafelTexts as t } from "../../../texts/energyTexts";
import TafelControls from "./TafelControls";
import TafelResult from "./TafelResult";
import TafelRows from "./TafelRows";
import { AKZENT, TAFEL_EASE } from "./tafelStyles";

export interface TafelScreenProps {
  teile: TafelTeil[];
  onAbschluss: () => void;
  onTeilen: () => void;
  onClose: () => void;
}

/** Vollbild für den Kunden (v1 EnergyTafel): Tippen zeigt die nächste Zeile, am Ende zählt die Ersparnis hoch. */
export default function TafelScreen({ teile, onAbschluss, onTeilen, onClose }: TafelScreenProps) {
  const tafeln = useMemo(() => tafelnFuer(teile), [teile]);
  const steps = useTafelSteps(tafeln, onClose);
  const { tafel } = steps;
  const Icon = tafel.art === "gas" ? Flame : Zap;
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={t.dialog}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.28, ease: TAFEL_EASE }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="relative flex items-center justify-between gap-3 px-4 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tafel.titel} className="min-w-0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <div className={cn("flex items-center gap-2 text-sm font-bold", AKZENT[tafel.art])}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tafel.titel}</span>
            </div>
            {tafel.hinweise.length > 0 && <div className="mt-0.5 text-[11px] text-white/50">{tafel.hinweise.join(" · ")}</div>}
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={onClose} aria-label={t.close} className="flex items-center justify-center rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label={t.next}
        onClick={steps.weiter}
        onKeyDown={(ev) => {
          if (ev.key !== "Enter" && ev.key !== " ") return;
          ev.preventDefault();
          steps.weiter();
        }}
        className="relative flex-1 overflow-y-auto px-4 pb-4 outline-none"
      >
        <div className="mx-auto max-w-xl">
          <TafelRows tafel={tafel} gezeigt={steps.gezeigt} />
          {steps.fertig && <TafelResult key={tafel.titel} tafel={tafel} />}
          {!steps.fertig && (
            <motion.p
              className="mt-10 text-center text-xs text-white/30"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {t.tippen}
            </motion.p>
          )}
        </div>
      </div>
      <TafelControls
        fertig={steps.fertig}
        letzte={steps.letzte}
        amAnfang={steps.amAnfang}
        naechste={steps.naechste}
        onZurueck={steps.zurueck}
        onWeiter={steps.weiter}
        onAlles={steps.allesZeigen}
        onClose={onClose}
        onAbschluss={onAbschluss}
        onTeilen={onTeilen}
      />
    </motion.div>
  );
}
