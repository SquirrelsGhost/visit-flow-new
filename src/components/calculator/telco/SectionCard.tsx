import { Receipt, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import GlassChip from "../../glass/GlassChip";
import GlassIcon from "../../glass/GlassIcon";
import { CALC_CARD, CALC_LABEL } from "../calcGlass";

interface SectionCardProps {
  tone: "red" | "green";
  /** Aus v1, im Glas-Design ersetzt ein Symbol das Emoji. */
  emoji?: string;
  title: string;
  badge: ReactNode;
  children: ReactNode;
}

const TONES = {
  red: { icon: Receipt, glass: "red", chip: "red" },
  green: { icon: Sparkles, glass: "green", chip: "green" },
} as const;

/** Die zwei Spalten aus v1 als Glaskarten: "Aktuell" (was der Kunde heute zahlt) und "Neu" (das Angebot). */
export default function SectionCard({ tone, title, badge, children }: SectionCardProps) {
  const t = TONES[tone];
  return (
    <section className={`${CALC_CARD} min-w-0 space-y-4`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2.5">
          <GlassIcon icon={t.icon} tone={t.glass} />
          <span className={CALC_LABEL}>{title}</span>
        </h3>
        <GlassChip tone={t.chip}>
          <span className="tabular-nums">{badge}</span>
        </GlassChip>
      </div>
      {children}
    </section>
  );
}
