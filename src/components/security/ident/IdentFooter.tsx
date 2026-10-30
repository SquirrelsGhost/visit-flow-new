import { ArrowLeft, ArrowRight, BadgeCheck, CircleAlert } from "lucide-react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { GLASS_BUTTON_INLINE } from "@/components/glass/glassStyles";
import { cn } from "@/lib/cn";
import { identWizardTexts } from "@/texts/identWizardTexts";

interface IdentFooterProps {
  showBack: boolean;
  onBack: () => void;
  /** Sichtbarer Text des Hauptknopfs; ariaLabel ergänzt ihn, wenn er gekürzt ist. */
  label: ReactNode;
  ariaLabel?: string;
  final: boolean;
  ready: boolean;
  onPrimary: () => void;
  /** Hinweis nach einem Versuch, obwohl der Schritt noch nicht vollständig ist. */
  hint: string | null;
  /** Zählt die Fehlversuche hoch, damit der Hinweis bei jedem Versuch kurz wackelt. */
  attempt: number;
}

const BACK =
  "glass-surface inline-flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-4 text-sm font-semibold text-foreground transition-[background-color,transform] duration-200 hover:bg-[var(--glass-hover)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 motion-reduce:transition-none";

/** Fußleiste mit Zurück und Weiter bzw. Abschließen; noch unvollständige Schritte zeigen beim Tippen, was fehlt. */
export default function IdentFooter({ showBack, onBack, label, ariaLabel, final, ready, onPrimary, hint, attempt }: IdentFooterProps) {
  const shake = useAnimationControls();

  useEffect(() => {
    if (attempt > 0) void shake.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.4 } });
  }, [attempt, shake]);

  return (
    <div className="shrink-0 border-t border-[var(--glass-divider)] px-5 pb-4 pt-3.5 lg:px-8 lg:pb-6">
      <AnimatePresence initial={false}>
        {hint && (
          <motion.p key="hint" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <motion.span animate={shake} className="flex items-center gap-1.5 pb-3 text-[12.5px] font-medium text-red-600 dark:text-red-400">
              <CircleAlert className="h-4 w-4 shrink-0" />
              {hint}
            </motion.span>
          </motion.p>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-3">
        {showBack && (
          <button type="button" onClick={onBack} className={BACK}>
            <ArrowLeft className="h-4 w-4" />
            {identWizardTexts.back}
          </button>
        )}
        <button type="button" onClick={onPrimary} aria-label={ariaLabel} className={cn(GLASS_BUTTON_INLINE, "min-w-0 flex-1 px-5 lg:ml-auto lg:flex-none lg:px-7", !ready && "opacity-55 saturate-[0.6]")}>
          {final && <BadgeCheck className="h-[18px] w-[18px] shrink-0" />}
          <span className="truncate">{label}</span>
          {!final && <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transition-none" />}
        </button>
      </div>
    </div>
  );
}
