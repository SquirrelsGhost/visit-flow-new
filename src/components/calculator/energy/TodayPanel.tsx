// Wechsel zwischen Abschlag und Abrechnung blendet weich über
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { EnergySell } from "../../../hooks/useEnergyPencilSell";
import { cn } from "../../../lib/cn";
import { heuteJahrCent, offeneSchritte } from "../../../lib/energy/energyPreview";
import { energyTexts as t } from "../../../texts/energyTexts";
import GlassSwitch from "../../glass/GlassSwitch";
import { CALC_TILE, CALC_TILE_HOVER } from "../calcGlass";
import EnergyField from "./EnergyField";
import ExactInputs from "./ExactInputs";
import { FARBE, PANEL } from "./energyStyles";
import PanelHead from "./PanelHead";
import QuickInputs from "./QuickInputs";
import Segmented from "./Segmented";

interface TodayPanelProps {
  sell: EnergySell;
}

const MODI = [
  { wert: "schnell" as const, label: t.modes.schnell },
  { wert: "genau" as const, label: t.modes.genau },
];

/** Schritt 1 "Heute": was der Kunde bisher zahlt, geschätzt aus dem Abschlag oder genau aus der Abrechnung. */
export default function TodayPanel({ sell }: TodayPanelProps) {
  const { s, aktiv, actions } = sell;
  const farbe = FARBE[aktiv];
  const offen = offeneSchritte(s);
  const fertig = !offen.includes("heute") && !offen.includes("verbrauch");
  return (
    <section className={PANEL} aria-label={t.today}>
      <PanelHead schritt={1} titel={t.today} hinweis={t.todayHint} jahrCent={heuteJahrCent(s)} fertig={fertig} aktivKlasse={farbe.aktiv} />
      <Segmented label={t.today} werte={MODI} wert={s.modus} onChange={(modus) => actions.setS({ modus })} aktivKlasse={farbe.aktiv} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${aktiv}-${s.modus}`}
          className="space-y-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {s.modus === "schnell" ? <QuickInputs sell={sell} /> : <ExactInputs sell={sell} />}
        </motion.div>
      </AnimatePresence>
      <div className="space-y-3">
        <EnergyField
          label={t.altVersorger}
          value={s.altVersorger}
          onChange={(altVersorger) => actions.setS({ altVersorger })}
          numerisch={false}
          placeholder={t.altVersorgerPlaceholder}
        />
        <button
          type="button"
          role="switch"
          aria-checked={s.grundversorgung}
          onClick={() => actions.setS({ grundversorgung: !s.grundversorgung })}
          className={cn(CALC_TILE, CALC_TILE_HOVER, "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40")}
        >
          {t.grundversorgung}
          <GlassSwitch checked={s.grundversorgung} />
        </button>
      </div>
    </section>
  );
}
