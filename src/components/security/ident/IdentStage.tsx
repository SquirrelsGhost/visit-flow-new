import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useState, type ReactNode } from "react";
import { SOFT_SPRING } from "@/lib/motion/presets";

interface IdentStageProps {
  /** Position im Ablauf; bestimmt, ob der neue Inhalt von rechts oder links kommt. */
  step: number;
  title: string;
  text: string;
  children: ReactNode;
}

const OFFSET = 36;
const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * OFFSET, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { ...SOFT_SPRING, opacity: { duration: 0.25 } } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -OFFSET, filter: "blur(4px)", transition: { duration: 0.18 } }),
};
const fade: Variants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

/** Scrollbarer Inhalt eines Schritts: gleitet je nach Richtung von rechts oder links herein, ohne Bewegung nur Überblendung. */
export default function IdentStage({ step, title, text, children }: IdentStageProps) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState({ step, direction: 1 });
  if (shown.step !== step) setShown({ step, direction: step > shown.step ? 1 : -1 });
  const direction = step === shown.step ? shown.direction : step > shown.step ? 1 : -1;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-6 pt-6 lg:px-8">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div key={step} custom={direction} variants={reduce ? fade : slide} initial="enter" animate="center" exit="exit">
          <h3 className="text-[23px] font-semibold leading-tight tracking-[-0.025em] text-foreground">{title}</h3>
          <p className="mt-1.5 text-[13.5px] leading-snug text-muted-foreground">{text}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
