import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ME_CARD } from "../../../lib/assistant/meStyles";
import { cn } from "../../../lib/cn";
import { riseIn } from "../../../lib/motion/presets";

interface MeCardProps {
  icon: LucideIcon;
  /** Hintergrund und Farbe des Symbol-Kästchens. */
  iconTone: string;
  title: string;
  sub?: string;
  action?: ReactNode;
  /** Trennlinie unter dem Kopf wie bei Provision und Zielen in v1. */
  divided?: boolean;
  className?: string;
  children: ReactNode;
}

/** Karte im Reiter "Ich": Symbol, Titel und kleiner Untertitel im Kopf, steigt in der Staffel weich auf. */
export default function MeCard({ icon: Icon, iconTone, title, sub, action, divided = false, className, children }: MeCardProps) {
  return (
    <motion.section variants={riseIn} className={cn("overflow-hidden", ME_CARD, className)}>
      <header className={cn("flex items-center justify-between gap-3 px-4 py-3", divided && "border-b border-slate-100 dark:border-slate-800")}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconTone)}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] leading-tight font-bold text-slate-900 dark:text-white">{title}</h3>
            {sub && <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{sub}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </motion.section>
  );
}
