import { Sparkles, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";

export type SectionTone = "blue" | "green" | "purple";

const TONES: Record<SectionTone, { header: string; icon: string; border: string }> = {
  blue: { header: "from-blue-500/[0.08]", icon: "text-blue-600 dark:text-blue-400", border: "" },
  green: { header: "from-emerald-500/[0.08]", icon: "text-emerald-600 dark:text-emerald-400", border: "" },
  purple: { header: "from-violet-500/[0.1]", icon: "text-violet-600 dark:text-violet-400", border: "" },
};

interface SectionCardProps {
  icon: LucideIcon;
  title: ReactNode;
  tone: SectionTone;
  action?: ReactNode;
  /** Kleiner Funke am Symbol wie bei der Wissensdatenbank in v1. */
  sparkle?: boolean;
  children: ReactNode;
}

/** Karte des KI-Reiters: farbiger Verlauf im Kopf, Symbol und Titel wie v1, steigt beim Öffnen weich auf. */
export default function SectionCard({ icon: Icon, title, tone, action, sparkle = false, children }: SectionCardProps) {
  const t = TONES[tone];
  return (
    <motion.section variants={riseIn} className={cn("glass-surface overflow-hidden rounded-[24px]", t.border)}>
      <header className={cn("flex items-center gap-2 bg-gradient-to-r to-transparent px-4 pt-4 pb-3 md:px-6 md:pt-5", t.header)}>
        <span className="relative shrink-0">
          <Icon className={cn("h-5 w-5 md:h-6 md:w-6", t.icon)} />
          {sparkle && <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-yellow-500" />}
        </span>
        <h3 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground md:text-lg">{title}</h3>
        {action}
      </header>
      <div className="px-4 pt-3 pb-4 md:px-6 md:pb-6">{children}</div>
    </motion.section>
  );
}
