// Portal an <body> braucht den Browser
"use client";

import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { NAV_HEIGHT } from "../../lib/navigation/navItems";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { ICON_BUTTON, OUTLINE_BUTTON, PRIMARY_BUTTON } from "./abrechnungStyles";

interface BulkBarProps {
  count: number;
  confirmable: number;
  busy: boolean;
  onClaim: () => void;
  onTakeOver: () => void;
  onDelete: () => void;
  onClear: () => void;
}

const subscribeNever = () => () => {};

/**
 * Sammelaktionen, solange etwas ausgewählt ist; schwebt über der unteren Navigation.
 * Im Portal, weil <main> ein transform behält und fixed sonst an der Scrollfläche klebt (v1).
 */
export default function BulkBar({ count, confirmable, busy, onClaim, onTakeOver, onDelete, onClear }: BulkBarProps) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="fixed inset-x-0 z-40 px-4"
          style={{ bottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 12px)` }}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          transition={SOFT_SPRING}
        >
          <div role="toolbar" aria-label={t.selected(count)} className="mx-auto max-w-2xl rounded-[22px] border border-slate-200/80 bg-white/90 p-2 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-neutral-900/90">
            <div className="flex items-center gap-1 pl-2">
              <span className="mr-auto text-sm font-semibold text-slate-900 tabular-nums dark:text-white">{t.selected(count)}</span>
              <button type="button" onClick={onDelete} className={cn(ICON_BUTTON, "h-9 w-9")} aria-label={t.removeFromBilling}>
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={onClear} className="h-9 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]">
                {t.clearSelection}
              </button>
            </div>
            <div className="mt-1 flex gap-2">
              <button type="button" disabled={busy} onClick={onClaim} className={cn(OUTLINE_BUTTON, "flex-1")}>
                {t.claim}
              </button>
              {confirmable > 0 && (
                <button type="button" disabled={busy} onClick={onTakeOver} className={cn(PRIMARY_BUTTON, "flex-1")}>
                  {t.takeOverN(confirmable, confirmable === count)}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
