import { Home } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../../hooks/useTranslation";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import type { NavTarget } from "../../../lib/navigation/navTargets";
import { bottomNavTexts as texts } from "../../../texts/bottomNavTexts";

interface NavSlotPickerProps {
  slots: readonly NavTarget[];
  selected: number;
  onSelect: (slot: number) => void;
}

const SLOT = "relative flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[10.5px] font-medium transition-colors duration-300";

/** Kleine Leiste im Sheet: zeigt die Plätze wie unten, der bearbeitete leuchtet; Antippen wechselt den Platz. */
export default function NavSlotPicker({ slots, selected, onSelect }: NavSlotPickerProps) {
  const { t } = useTranslation();
  const cell = (target: NavTarget, slot: number) => {
    const Icon = target.icon;
    const active = slot === selected;
    return (
      <button
        key={slot}
        type="button"
        aria-pressed={active}
        aria-label={texts.slotButton(slot + 1, texts.slotNames[slot] ?? "", t(target.labelKey))}
        onClick={() => onSelect(slot)}
        className={cn(SLOT, active ? "text-red-600 dark:text-red-300" : "text-slate-500 hover:text-foreground dark:text-white/50")}
      >
        {active && (
          <motion.span
            layoutId="nav-slot-picker"
            transition={SNAPPY_SPRING}
            className="absolute inset-0 rounded-2xl bg-red-500/10 ring-1 ring-inset ring-red-500/40 dark:bg-red-400/10"
          />
        )}
        <Icon aria-hidden className="relative h-5 w-5" />
        <span className="relative max-w-full truncate px-1">{t(target.labelKey)}</span>
      </button>
    );
  };
  return (
    <div className="glass-surface flex items-center gap-1 rounded-[22px] p-1.5">
      {slots.slice(0, 2).map((target, i) => cell(target, i))}
      <span aria-label={texts.homeFixed} className="flex h-16 flex-1 items-center justify-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-red-500 to-red-700 text-white opacity-60 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          <Home aria-hidden className="h-[18px] w-[18px]" />
        </span>
      </span>
      {slots.slice(2).map((target, i) => cell(target, i + 2))}
    </div>
  );
}
