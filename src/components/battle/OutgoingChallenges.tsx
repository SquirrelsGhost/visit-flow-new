import { Hourglass } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Challenge } from "../../lib/battle/battleTypes";
import { cn } from "../../lib/cn";
import { GLASS_DIVIDER } from "../glass/glassStyles";
import { battleTexts as t } from "../../texts/battleTexts";
import ArenaSection from "./ArenaSection";
import { ARENA_CARD, AVATAR, initial } from "./battleStyles";
import SectionTitle from "./SectionTitle";

interface OutgoingChallengesProps {
  challenges: Challenge[];
}

/** Meine Herausforderungen, auf die noch niemand geantwortet hat: ruhige Zeilen mit tickender Sanduhr. */
export default function OutgoingChallenges({ challenges }: OutgoingChallengesProps) {
  if (challenges.length === 0) return null;
  return (
    <ArenaSection title={<SectionTitle count={challenges.length}>{t.outgoingTitle}</SectionTitle>}>
      <div className={cn(ARENA_CARD, GLASS_DIVIDER)}>
        <AnimatePresence initial={false}>
          {challenges.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center gap-3.5 px-4 py-3">
                <span className={cn(AVATAR, "opacity-80 grayscale-[0.3]")}>{initial(c.opponentName)}</span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">{c.opponentName}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--glass-track)] px-2.5 py-1 text-[12px] font-medium text-slate-500 dark:text-white/55">
                  <Hourglass aria-hidden className="h-3.5 w-3.5 animate-[spin_3s_ease-in-out_infinite] motion-reduce:animate-none" />
                  {t.outgoingPending}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ArenaSection>
  );
}
