import { Check, Copy, Target } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode, type Ref } from "react";
import { useCelebrate } from "../../hooks/useCelebrate";
import { cn } from "../../lib/cn";
import { feedback } from "../../lib/feedback/feedback";
import { riseIn } from "../../lib/motion/presets";
import { CELEBRATE_FROM } from "../../lib/simulator/simulatorCatalog";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassSheen from "../glass/GlassSheen";
import GlassSpotlight from "../glass/GlassSpotlight";
import { GLASS_BUTTON, GLASS_DEEP } from "../glass/glassStyles";
import { SECONDARY_BUTTON } from "./simulatorStyles";

interface ResultHeroProps {
  label: string;
  total: number;
  /** Ohne Auswahl: Hinweis statt Aktionen */
  empty?: boolean;
  onCopy: () => void;
  onGoal: () => void;
  goalSaved: boolean;
  heroRef?: Ref<HTMLElement>;
  children?: ReactNode;
}

const GLOW = "pointer-events-none absolute -top-28 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full bg-emerald-400/25 blur-3xl";
const NUMBER = "relative mt-2 block text-[46px] font-semibold leading-none tracking-[-0.035em] min-[400px]:text-[52px]";

/**
 * Ergebnis ganz oben als tiefe Glaskarte wie ein Kontostand: großer Betrag, darunter die Herleitung,
 * dann Kopieren und Als Ziel setzen. Überschreitet der Betrag die Feier-Schwelle, leuchtet die Kante einmal auf.
 */
export default function ResultHero({ label, total, empty, onCopy, onGoal, goalSaved, heroRef, children }: ResultHeroProps) {
  const celebrate = useCelebrate(total, CELEBRATE_FROM);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (celebrate) feedback("milestone");
  }, [celebrate]);
  return (
    <motion.section ref={heroRef} variants={riseIn} className={cn(GLASS_DEEP, "relative px-5 pt-7 pb-5 text-center")}>
      <GlassSpotlight />
      <GlassSheen />
      <span aria-hidden className={GLOW} />
      {celebrate && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-emerald-300/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}
      <h2 className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">{label}</h2>
      <div aria-live="polite" className={cn(NUMBER, total > 0 ? "glass-text-shine" : "text-white/40")}>
        <GlassNumber value={total} kind="euro" duration={0.8} />
      </div>
      <div className="relative mt-3.5 space-y-1 text-[13px] text-white/60">{empty ? <p>{t.hero.empty}</p> : children}</div>
      {!empty && (
        <div className="relative mt-5 flex gap-2">
          <button type="button" onClick={onCopy} className={SECONDARY_BUTTON}>
            <Copy aria-hidden className="h-4 w-4" />
            {t.hero.copy}
          </button>
          <button type="button" onClick={onGoal} className={cn(GLASS_BUTTON, "w-auto flex-[1.4]", goalSaved && "from-emerald-500 to-emerald-600")}>
            {goalSaved ? <Check aria-hidden className="h-4 w-4" /> : <Target aria-hidden className="h-4 w-4" />}
            {goalSaved ? t.hero.goalSaved : t.hero.goal}
          </button>
        </div>
      )}
    </motion.section>
  );
}
