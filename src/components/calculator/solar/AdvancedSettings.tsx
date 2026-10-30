// Aufklappen und drehendes Zahnrad
"use client";

import { ChevronDown, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { SolarSell } from "../../../hooks/useSolarPencilSell";
import { solarTexts as t } from "../../../texts/solarTexts";
import Reveal from "../../ui/Reveal";
import SolarSlider from "./SolarSlider";
import { TILE } from "./solarStyles";

interface AdvancedSettingsProps {
  sell: SolarSell;
}

/** Strompreis, Einspeisevergütung und Preissteigerung, standardmäßig eingeklappt. */
export default function AdvancedSettings({ sell }: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false);
  const { input, set } = sell;
  return (
    <div className={`${TILE} overflow-hidden`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left text-[14px] font-semibold transition-colors duration-300 hover:bg-[var(--glass-hover)]"
      >
        <span className="flex items-center gap-2">
          <motion.span animate={{ rotate: open ? 90 : 0 }} className="text-muted-foreground">
            <Settings className="h-4 w-4" />
          </motion.span>
          {t.advanced}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <Reveal show={open}>
        <div className="space-y-4 border-t border-[var(--glass-divider)] p-4">
          <SolarSlider
            small
            label={t.price}
            value={input.electricityPrice}
            display={`${Math.round(input.electricityPrice * 100)} Cent/kWh`}
            min={0.25}
            max={0.55}
            step={0.01}
            onChange={(electricityPrice) => set({ electricityPrice })}
          />
          <SolarSlider
            small
            label={t.feedIn}
            value={input.feedInTariff}
            display={`${(input.feedInTariff * 100).toFixed(1).replace(".", ",")} Cent/kWh`}
            min={0.05}
            max={0.15}
            step={0.005}
            onChange={(feedInTariff) => set({ feedInTariff })}
          />
          <SolarSlider
            small
            label={t.inflation}
            value={input.inflation}
            display={`${String(input.inflation).replace(".", ",")}%`}
            min={0}
            max={10}
            step={0.5}
            onChange={(inflation) => set({ inflation })}
          />
        </div>
      </Reveal>
    </div>
  );
}
