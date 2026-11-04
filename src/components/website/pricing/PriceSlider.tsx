import type { CSSProperties } from "react";
import { websiteSectionTexts } from "../../../texts/websiteSectionTexts";

/** Regler für die Teamgröße (5 bis 60 Berater) mit gefülltem Verlauf bis zum Griff. */
interface PriceSliderProps {
  team: number;
  onChange: (team: number) => void;
}

const t = websiteSectionTexts.pricing;
const RANGE =
  "mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,#fb7185,#dc2626_var(--fill),rgba(255,255,255,0.1)_var(--fill))] " +
  "[&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_4px_20px_rgba(239,68,68,0.7)] " +
  "[&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white";

export default function PriceSlider({ team, onChange }: PriceSliderProps) {
  const fill = ((team - t.minLicenses) / (t.maxLicenses - t.minLicenses)) * 100;
  return (
    <div className="mt-10">
      <div className="flex justify-between text-sm">
        <label htmlFor="vfw-team" className="text-white/60">
          {t.sliderLabel}
        </label>
        <output htmlFor="vfw-team" className="font-semibold tabular-nums">
          {team} {t.advisors}
        </output>
      </div>
      <input
        id="vfw-team"
        type="range"
        min={t.minLicenses}
        max={t.maxLicenses}
        value={team}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        className={RANGE}
      />
    </div>
  );
}
