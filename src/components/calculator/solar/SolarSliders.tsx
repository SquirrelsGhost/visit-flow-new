import { Battery, TrendingUp, Zap } from "lucide-react";
import type { SolarSell } from "../../../hooks/useSolarPencilSell";
import { solarTexts as t } from "../../../texts/solarTexts";
import SolarSlider from "./SolarSlider";

interface SolarSlidersProps {
  sell: SolarSell;
}

/** Verbrauch, Dachfläche und Speicher (innerhalb des Schritts "Anlage"). */
export default function SolarSliders({ sell }: SolarSlidersProps) {
  const { input, result, set } = sell;
  return (
    <div className="space-y-5">
      <SolarSlider
        icon={<Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />}
        label={t.consumption}
        value={input.consumptionKwh}
        display={`${input.consumptionKwh.toLocaleString("de-DE")} kWh`}
        min={1500}
        max={15000}
        step={250}
        onChange={(consumptionKwh) => set({ consumptionKwh })}
        marks={t.consumptionMarks}
      />
      <SolarSlider
        icon={<TrendingUp className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />}
        label={t.roof}
        value={input.roofSqm}
        display={t.roofValue(input.roofSqm, result.maxPanels)}
        min={10}
        max={200}
        step={5}
        onChange={(roofSqm) => set({ roofSqm })}
        marks={t.roofMarks}
      />
      <SolarSlider
        icon={<Battery className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />}
        label={t.battery}
        value={input.batteryKwh}
        display={input.batteryKwh === 0 ? t.noBattery : `${input.batteryKwh} kWh`}
        min={0}
        max={20}
        step={1}
        onChange={(batteryKwh) => set({ batteryKwh })}
        marks={t.batteryMarks}
      />
    </div>
  );
}
