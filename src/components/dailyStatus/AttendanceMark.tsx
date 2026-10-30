import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { GLASS_TONES, type GlassTone } from "../../lib/glass/glassTones";
import { GLASS_ICON } from "../glass/glassStyles";

interface AttendanceMarkProps {
  icon: LucideIcon;
  tone: GlassTone;
  label: string;
  /** Heute schon so eingetragen. */
  active: boolean;
  onClick: () => void;
}

/** Kachel zum Abhaken (Anwesend, Zu spät, Entschuldigt, Fehlt); der heutige Eintrag ist hervorgehoben. */
export default function AttendanceMark({ icon: Icon, tone, label, active, onClick }: AttendanceMarkProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "glass-surface flex items-center gap-3 rounded-[20px] p-3 text-left text-[14px] font-semibold text-foreground ring-1 ring-inset transition-[box-shadow,background-color] duration-300",
        active ? "ring-red-500/40 bg-red-500/[0.06]" : "ring-transparent",
      )}
    >
      <span aria-hidden className={cn(GLASS_ICON, GLASS_TONES[tone].icon)}>
        <Icon className="h-[17px] w-[17px]" strokeWidth={2.3} />
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </motion.button>
  );
}
