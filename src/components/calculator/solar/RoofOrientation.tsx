import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import type { Orientation } from "../../../lib/solar/solarCalc";
import { solarTexts as t } from "../../../texts/solarTexts";
import { CALC_LABEL, CALC_TILE, CALC_TILE_HOVER } from "../calcGlass";

interface RoofOrientationProps {
  value: Orientation;
  onChange: (o: Orientation) => void;
}

const OPTIONS: Orientation[] = ["south", "east-west", "north"];

/** Süd, Ost/West oder Nord: bestimmt den Ertrag je kWp. */
export default function RoofOrientation({ value, onChange }: RoofOrientationProps) {
  return (
    <div>
      <span className={`mb-3 block ${CALC_LABEL}`}>{t.orientation}</span>
      <div className="grid grid-cols-3 gap-2.5">
        {OPTIONS.map((id) => {
          const active = value === id;
          return (
            <motion.button
              key={id}
              type="button"
              aria-pressed={active}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 text-center",
                active ? "rounded-2xl bg-emerald-500/10 text-emerald-700 ring-2 ring-inset ring-emerald-500/50 dark:text-emerald-300" : cn(CALC_TILE, CALC_TILE_HOVER, "text-foreground/80"),
              )}
            >
              <span className="text-[13px] font-semibold">{t.orientations[id].label}</span>
              <span className="mt-1 text-[11px] font-medium text-muted-foreground">{t.orientations[id].desc}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
