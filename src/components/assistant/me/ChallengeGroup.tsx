import { ChevronDown, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Challenge } from "../../../lib/assistant/meTypes";
import { ME_CARD } from "../../../lib/assistant/meStyles";
import { cn } from "../../../lib/cn";
import { riseIn, SOFT_SPRING, staggerParent } from "../../../lib/motion/presets";
import Collapse from "../Collapse";
import ChallengeCard from "./ChallengeCard";

interface ChallengeGroupProps {
  title: string;
  icon: LucideIcon;
  iconTone: string;
  challenges: readonly Challenge[];
  columns: string;
}

/** Aufklappbare Gruppe täglicher oder wöchentlicher Challenges mit Zähler der erledigten. */
export default function ChallengeGroup({ title, icon: Icon, iconTone, challenges, columns }: ChallengeGroupProps) {
  const [open, setOpen] = useState(true);
  const done = challenges.filter((c) => c.completed).length;
  return (
    <motion.section variants={riseIn}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn("mb-3 flex w-full items-center justify-between px-4 py-3 text-left", ME_CARD)}
      >
        <span className="flex items-center gap-2.5 text-[15px] font-bold text-slate-900 dark:text-white">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconTone)}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          {title}
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 tabular-nums dark:bg-slate-800 dark:text-slate-400">
            {done}/{challenges.length}
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SOFT_SPRING} className="text-slate-400">
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </span>
      </button>
      <Collapse open={open}>
        <motion.div className={cn("grid grid-cols-1 gap-3 pb-1", columns)} variants={staggerParent(0.06, 0)} initial="hidden" animate="show">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} c={c} />
          ))}
        </motion.div>
      </Collapse>
    </motion.section>
  );
}
