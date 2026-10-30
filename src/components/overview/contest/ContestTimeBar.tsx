import { motion } from "motion/react";
import { fill } from "../../../texts/profileTexts";
import { overviewTexts } from "../../../texts/overviewTexts";

interface ContestTimeBarProps {
  share: number;
  daysLeft: number;
}

const texts = overviewTexts.contest;
const GROW = { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 } as const;

const leftLabel = (days: number) => (days > 1 ? fill(texts.daysLeft, { days }) : days === 1 ? texts.dayLeft : texts.lastDay);

/** Wie viel Zeit des laufenden Gewinnspiels vorbei ist. */
export default function ContestTimeBar({ share, daysLeft }: ContestTimeBarProps) {
  return (
    <div className="mt-5">
      <div className="flex justify-between text-[12px] font-medium text-white/60">
        <span>{fill(texts.timeShare, { share: Math.round(share) })}</span>
        <span>{leftLabel(daysLeft)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-amber-300 to-orange-500 shadow-[0_0_12px_rgba(251,146,60,0.6)]" initial={{ scaleX: 0 }} animate={{ scaleX: share / 100 }} transition={GROW} />
      </div>
    </div>
  );
}
