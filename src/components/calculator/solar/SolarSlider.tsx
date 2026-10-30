import { useId, type ReactNode } from "react";

interface SolarSliderProps {
  icon?: ReactNode;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  marks?: readonly string[];
  small?: boolean;
}

// Runder Griff mit weichem Ring, auch in Firefox
const THUMB = [
  "h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-none",
  "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-md",
  "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 active:[&::-webkit-slider-thumb]:scale-110",
  "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-emerald-500/30",
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
  "[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:shadow-md",
].join(" ");

/** Schieberegler mit Wert-Plakette und Orientierungsmarken (v1 range-Inputs). Die Spur füllt sich bis zum Wert. */
export default function SolarSlider({ icon, label, value, display, min, max, step, onChange, marks, small }: SolarSliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className={`mb-2 flex justify-between gap-2 font-semibold ${small ? "text-[11px]" : "text-xs"}`}>
        <label htmlFor={id} className="flex items-center gap-1.5 text-foreground/80">
          {icon}
          {label}
        </label>
        <span className="shrink-0 rounded-full bg-[var(--glass-track)] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={THUMB}
        style={{ background: `linear-gradient(to right, rgb(16 185 129) ${fill}%, var(--glass-track) ${fill}%)` }}
      />
      {marks && (
        <div className="mt-1 flex justify-between text-[10px] font-medium text-muted-foreground/80">
          {marks.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}
