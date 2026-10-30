import { X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { motivationFor } from "../../../lib/assistant/motivation";
import type { Vertical } from "../../../lib/battle/battleCategories";
import type { MeMetrics } from "../../../lib/assistant/meTypes";
import { cn } from "../../../lib/cn";
import { SOFT_SPRING } from "../../../lib/motion/presets";
import { readPreference, writePreference } from "../../../lib/preferences";
import { meTexts as t } from "../../../texts/assistantTexts";

/** Weggeklickt gilt das Banner bis Mitternacht (v1 "dashboardInfoBoxHidden" mit Datum). */
const HIDDEN_KEY = "dashboardInfoBoxHidden";
const today = () => new Date().toDateString();

const TONES = {
  success: { box: "border-transparent bg-gradient-to-r from-emerald-500/[0.1] to-transparent", icon: "from-green-500 to-emerald-600" },
  warning: { box: "border-transparent bg-gradient-to-r from-amber-500/[0.12] to-transparent", icon: "from-amber-500 to-orange-500" },
} as const;

/** Kurzer Zuspruch, nur wenn es einen echten Anlass gibt (starker Tag, Bonus nah, Ziel erreicht). */
export interface MotivationBannerProps { m: MeMetrics; vertical: Vertical }

export default function MotivationBanner({ m, vertical }: MotivationBannerProps) {
  const [dismissed, setDismissed] = useState(() => readPreference(HIDDEN_KEY) === today());
  const motivation = motivationFor(m, vertical);

  const dismiss = () => {
    writePreference(HIDDEN_KEY, today());
    setDismissed(true);
  };

  return (
    <AnimatePresence initial={false}>
      {motivation && !dismissed && (
        <motion.div
          key={motivation.kind}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.3 } }}
          transition={SOFT_SPRING}
          className={cn("glass-surface flex items-start gap-3 rounded-[22px] p-3.5 pr-10", TONES[motivation.tone].box)}
          role="status"
        >
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", TONES[motivation.tone].icon)}>
            <Zap className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] leading-tight font-bold text-slate-900 dark:text-white">{t.motivation[motivation.kind].title}</h3>
            <p className="mt-0.5 text-xs leading-snug text-slate-600 dark:text-slate-400">{t.motivation[motivation.kind].message(motivation.value ?? 0)}</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.close}
            className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
