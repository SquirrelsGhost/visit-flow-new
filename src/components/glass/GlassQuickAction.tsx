import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface GlassQuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Runder Schnellknopf unter einer Kopfkarte (wie in Banking-Apps): Glasknopf, Beschriftung darunter. */
export default function GlassQuickAction({ icon: Icon, label, onClick, disabled = false }: GlassQuickActionProps) {
  return (
    <motion.button type="button" onClick={onClick} disabled={disabled} whileTap={{ scale: 0.92 }} className="group flex min-w-0 flex-1 flex-col items-center gap-2 focus:outline-none disabled:opacity-50">
      <span className="glass-surface flex h-14 w-14 items-center justify-center rounded-full transition-[background-color] duration-300 group-hover:bg-[var(--glass-fill-strong)] group-focus-visible:ring-4 group-focus-visible:ring-red-500/20">
        <Icon aria-hidden className="h-[21px] w-[21px] text-foreground" strokeWidth={2.1} />
      </span>
      <span className="max-w-full truncate text-[12px] font-semibold text-foreground/80">{label}</span>
    </motion.button>
  );
}
