import { Trophy } from "lucide-react";
import GlassCard from "../../glass/GlassCard";

interface ContestEmptyProps {
  title: string;
  hint: string;
}

/** Ruhiger Hinweis, wenn kein Gewinnspiel läuft oder eines noch eingerichtet wird. */
export default function ContestEmpty({ title, hint }: ContestEmptyProps) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--glass-track)]">
        <Trophy aria-hidden className="h-7 w-7 text-slate-400 dark:text-white/30" />
      </span>
      <p className="text-[16px] font-semibold text-foreground">{title}</p>
      <p className="text-[13px] text-muted-foreground">{hint}</p>
    </GlassCard>
  );
}
