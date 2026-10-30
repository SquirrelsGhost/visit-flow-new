import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { riseIn } from "../../lib/motion/presets";

interface SuccessStatProps {
  label: string;
  value: string;
  highlight?: boolean;
}

/** Eine Kennzahl des fertigen Teams (Plätze, Tarife, Schutz). */
export default function SuccessStat({ label, value, highlight = false }: SuccessStatProps) {
  return (
    <motion.div
      variants={riseIn}
      className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-center dark:border-white/10 dark:bg-white/[0.02]"
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-lg font-bold tracking-tight", highlight ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
        {value}
      </div>
    </motion.div>
  );
}
