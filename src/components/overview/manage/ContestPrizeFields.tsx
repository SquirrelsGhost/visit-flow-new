import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { contestFormTexts as texts } from "../../../texts/contestFormTexts";
import { fill } from "../../../texts/profileTexts";
import RankBadge from "../contest/RankBadge";
import { GLASS_FIELD, GLASS_LABEL } from "../../glass/glassStyles";

interface ContestPrizeFieldsProps {
  prizes: readonly string[];
  onChange: (prizes: string[]) => void;
}

const MAX_PRIZES = 10;

/** Preise je Platz; neue Plätze gleiten weich dazu. */
export default function ContestPrizeFields({ prizes, onChange }: ContestPrizeFieldsProps) {
  const set = (index: number, value: string) => onChange(prizes.map((p, i) => (i === index ? value : p)));
  return (
    <section>
      <h3 className={GLASS_LABEL}>{texts.prizes}</h3>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {prizes.map((prize, index) => (
            <motion.div key={index} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={SOFT_SPRING} className="flex items-center gap-2.5">
              <RankBadge rank={index + 1} />
              <input aria-label={fill(texts.prizeRank, { rank: index + 1 })} value={prize} onChange={(e) => set(index, e.target.value)} placeholder={texts.prizePlaceholder} maxLength={80} className={cn(GLASS_FIELD, "flex-1")} />
              {prizes.length > 1 && (
                <button type="button" aria-label={texts.removePrize} onClick={() => onChange(prizes.filter((_, i) => i !== index))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:text-white/40">
                  <X className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {prizes.length < MAX_PRIZES && (
          <button type="button" onClick={() => onChange([...prizes, ""])} className="flex items-center gap-2 px-1 py-1.5 text-[13px] font-semibold text-red-600 dark:text-red-400">
            <Plus className="h-4 w-4" />
            {texts.addPrize}
          </button>
        )}
      </div>
    </section>
  );
}
