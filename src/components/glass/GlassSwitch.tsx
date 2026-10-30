import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING } from "../../lib/motion/presets";

interface GlassSwitchProps {
  checked: boolean;
}

/** Schalter (nur Optik): eingeschaltet leuchtet die Bahn grün, der Knopf gleitet federnd hinüber. */
export default function GlassSwitch({ checked }: GlassSwitchProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-[30px] w-[51px] shrink-0 items-center rounded-full p-[3px] transition-[background-color,box-shadow] duration-300",
        checked
          ? "justify-end bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_rgba(16,185,129,0.7)]"
          : "justify-start bg-[var(--glass-track)] shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]",
      )}
    >
      <motion.span layout transition={SNAPPY_SPRING} className="h-6 w-6 rounded-full bg-gradient-to-b from-white to-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.3)]" />
    </span>
  );
}
