import { Check, Copy, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import type { AssistantHotline } from "../../../lib/assistant/verticalAssistant";
import { assistantTexts as t } from "../../../texts/assistantTexts";

/** v1 zeigt den Haken nach dem Kopieren zwei Sekunden lang. */
const COPY_FEEDBACK_MS = 2000;

/** Die Hotline der Sparte: großer grüner Anruf-Knopf und Kopieren daneben; fehlt die Nummer noch, ein ruhiger Hinweis. */
export interface HotlineNumberProps { hotline: AssistantHotline }

export default function HotlineNumber({ hotline }: HotlineNumberProps) {
  const { number } = hotline;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      if (!number) return;
      await navigator.clipboard.writeText(number);
      setCopied(true);
      toast.success(t.copied);
    } catch {
      toast.error(t.copyNumber);
    }
  };

  return (
    <div className="glass-surface rounded-[18px] p-3 transition-colors hover:border-green-300 md:p-4 dark:hover:border-green-700">
      <div className="flex items-start gap-3">
        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 md:h-6 md:w-6" />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-semibold md:text-base">{hotline.title}</p>
          <p className="mb-2 text-xs text-slate-600 md:mb-3 md:text-sm dark:text-slate-400">{hotline.description}</p>
          {number ? (
            <div className="flex items-center gap-2">
              <a
                href={`tel:${number}`}
                className="flex h-10 flex-1 items-center justify-center rounded-lg bg-green-600 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition-[background-color,transform] hover:bg-green-700 active:scale-[0.98] md:h-11"
              >
                {number}
              </a>
              <button
                type="button"
                onClick={copy}
                aria-label={t.copyNumber}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-card transition-colors hover:bg-muted md:h-11 md:w-11"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={copied ? "ok" : "copy"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={SNAPPY_SPRING}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          ) : (
            <p className="flex h-10 items-center justify-center rounded-lg border border-dashed border-amber-300 bg-amber-50/60 text-sm font-medium text-amber-700 md:h-11 dark:border-amber-700/60 dark:bg-amber-950/20 dark:text-amber-300">
              {t.numberPending}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
