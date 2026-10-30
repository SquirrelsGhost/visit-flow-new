import { motion } from "motion/react";
import { Target } from "lucide-react";
import type { CoachBriefing } from "../../lib/coach/coachBriefing";
import { coachTexts } from "../../texts/coachTexts";
import { GLASS_INSET } from "../glass/glassStyles";

interface CopilotBriefingProps {
  briefing: CoachBriefing;
  onPractice: (prompt: string) => void;
}

const PRACTICE =
  "glass-keep-white no-touch-target-fix mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-red-500 to-red-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_18px_-8px_rgba(220,38,38,0.75)] active:scale-[0.97]";

/** Persönliches Tagesbriefing als erste Karte im frischen Chat, gerechnet aus den eigenen Türen. */
export default function CopilotBriefing({ briefing, onPractice }: CopilotBriefingProps) {
  return (
    <motion.section
      className={`${GLASS_INSET} p-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, type: "spring", stiffness: 320, damping: 30 }}
      aria-label={briefing.title}
    >
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--glass-label)]">{briefing.title}</h3>
      <ul className="mt-2 space-y-1.5 text-[13.5px] leading-snug text-foreground">
        {briefing.lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-rose-400 to-red-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {briefing.focus && (
        <div className="mt-3 rounded-2xl bg-red-500/[0.07] p-3 ring-1 ring-inset ring-red-500/15">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 dark:text-rose-300">
            <Target className="h-3.5 w-3.5" />
            {coachTexts.focusLabel}
          </p>
          <p className="mt-1 text-[13.5px] leading-snug text-foreground">{briefing.focus.text}</p>
          <button type="button" className={PRACTICE} onClick={() => briefing.focus && onPractice(briefing.focus.prompt)}>
            {coachTexts.practice}
          </button>
        </div>
      )}
    </motion.section>
  );
}
