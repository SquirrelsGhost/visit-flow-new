import { Check } from "lucide-react";
import { motion } from "motion/react";
import { Fragment } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "../../lib/cn";
import { SNAPPY_SPRING, SOFT_SPRING } from "../../lib/motion/presets";
import type { StepDef } from "../../lib/register/registerSteps";

interface RegisterStepperProps {
  steps: StepDef[];
  current: number;
}

/** Fortschritt aus v1. Die Linien füllen sich weich, der aktuelle Schritt hebt sich leicht hervor. */
export default function RegisterStepper({ steps, current }: RegisterStepperProps) {
  const { t } = useTranslation();
  return (
    <ol className="mb-6 flex items-start px-1" aria-label="Fortschritt">
      {steps.map((step, index) => {
        const done = index < current;
        const reached = index <= current;
        return (
          <Fragment key={step.id}>
            {index > 0 && (
              <li aria-hidden="true" className="mx-1 mt-4 h-1 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-red-600 to-red-500"
                  initial={false}
                  animate={{ scaleX: reached ? 1 : 0 }}
                  transition={SOFT_SPRING}
                />
              </li>
            )}
            <motion.li layout="position" transition={SOFT_SPRING} className="flex w-12 shrink-0 flex-col items-center" aria-current={index === current ? "step" : undefined}>
              <motion.div
                initial={false}
                animate={{ scale: index === current ? 1.1 : 1 }}
                transition={SNAPPY_SPRING}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors duration-300",
                  reached
                    ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_6px_14px_-6px_rgba(220,38,38,0.7)]"
                    : "bg-slate-100 text-muted-foreground dark:bg-white/[0.06]",
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index + 1}
              </motion.div>
              <span className={cn("mt-1 text-center text-[10px] font-medium transition-colors duration-300", reached ? "text-foreground" : "text-muted-foreground")}>
                {t(step.label)}
              </span>
            </motion.li>
          </Fragment>
        );
      })}
    </ol>
  );
}
