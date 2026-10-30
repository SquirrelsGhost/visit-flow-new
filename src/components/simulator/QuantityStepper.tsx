import { Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import { ICON_BUTTON, MONEY } from "./simulatorStyles";

interface QuantityStepperProps {
  name: string;
  quantity: number;
  onChange: (delta: number) => void;
}

/** Menge − / + ; bei einer Einheit wird aus Minus der Papierkorb. Die Zahl rollt beim Ändern weich. */
export default function QuantityStepper({ name, quantity, onChange }: QuantityStepperProps) {
  const last = quantity <= 1;
  return (
    <span className="flex shrink-0 items-center rounded-full bg-[var(--glass-track)] p-0.5">
      <button type="button" onClick={() => onChange(-1)} aria-label={fill(last ? t.basket.remove : t.basket.less, { name })} className={`${ICON_BUTTON} h-8 w-8`}>
        {last ? <Trash2 aria-hidden className="h-3.5 w-3.5 text-rose-500" /> : <Minus aria-hidden className="h-3.5 w-3.5" />}
      </button>
      <span className={`relative w-7 overflow-hidden text-center text-[15px] font-semibold ${MONEY}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={quantity}
            className="block"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" onClick={() => onChange(1)} aria-label={fill(t.basket.more, { name })} className={`${ICON_BUTTON} h-8 w-8`}>
        <Plus aria-hidden className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
