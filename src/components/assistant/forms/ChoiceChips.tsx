import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { feedback } from "../../../lib/feedback/feedback";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { FORM_FIELD_LABEL } from "./formStyles";

export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T extends string> {
  label: string;
  choices: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Eindeutig je Auswahl, damit die gleitende Fläche nicht zwischen Gruppen springt. */
  id: string;
  /** Beschriftung nur für Screenreader. */
  hideLabel?: boolean;
}

const CHIP =
  "relative flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Einfachauswahl als Glasschiene (Anrede, Termin); die helle Fläche gleitet federnd zur Wahl. */
export default function ChoiceChips<T extends string>({ label, choices, value, onChange, id, hideLabel = false }: ChoiceChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="min-w-0">
      {!hideLabel && <span className={FORM_FIELD_LABEL}>{label}</span>}
      <div className="flex gap-1 rounded-2xl bg-[var(--glass-track)] p-1">
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                if (!selected) feedback("select");
                onChange(choice.value);
              }}
              className={cn(CHIP, selected ? "text-foreground" : "text-slate-500 hover:text-foreground dark:text-white/50")}
            >
              {selected && (
                <motion.span
                  layoutId={`${id}-choice`}
                  transition={SNAPPY_SPRING}
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_18px_-10px_rgba(15,23,42,0.35)] dark:bg-white/[0.12]"
                />
              )}
              <span className="relative">{choice.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
