import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { licenseTexts } from "../../../texts/licenseTexts";

interface CountStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const texts = licenseTexts.sheets.count;
const STEP = "glass-surface flex h-14 w-14 items-center justify-center rounded-full text-foreground transition-opacity disabled:opacity-35";

/** Große Zahl mit runden Minus- und Plus-Knöpfen; die Zahl springt bei jeder Änderung weich nach. */
export default function CountStepper({ value, min, max, onChange }: CountStepperProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <motion.button type="button" whileTap={{ scale: 0.9 }} className={STEP} aria-label={texts.less} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="h-5 w-5" />
      </motion.button>
      <div className="text-center">
        <motion.p key={value} initial={{ y: 8, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} aria-live="polite" className="text-[52px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-foreground">
          {value}
        </motion.p>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--glass-label)]">{texts.unit}</p>
      </div>
      <motion.button type="button" whileTap={{ scale: 0.9 }} className={STEP} aria-label={texts.more} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
