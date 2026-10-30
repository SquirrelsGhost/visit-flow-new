// Portal an <body> braucht den Browser
"use client";

import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { NAV_HEIGHT } from "../../lib/navigation/navItems";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { crmOverviewTexts as t } from "../../texts/crmOverviewTexts";
import { GLASS_POPOVER } from "../glass/glassStyles";

interface OverviewBulkBarProps {
  open: boolean;
  count: number;
  allSelected: boolean;
  busy: boolean;
  onToggleAll: () => void;
  onDelete: () => void;
}

const subscribeNever = () => () => {};
const GHOST = "h-10 rounded-xl px-3 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-[var(--glass-hover)] dark:text-white/70";

/** Sammelaktionen im Auswahlmodus; schwebt über der unteren Navigation (im Portal, wie die Abrechnung). */
export default function OverviewBulkBar({ open, count, allSelected, busy, onToggleAll, onDelete }: OverviewBulkBarProps) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 z-40 px-4"
          style={{ bottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 12px)` }}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          transition={SOFT_SPRING}
        >
          <div role="toolbar" aria-label={t.selected(count)} className={`${GLASS_POPOVER} mx-auto flex max-w-2xl items-center gap-1 p-2 pl-4 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]`}>
            <span className="mr-auto text-sm font-semibold tabular-nums text-foreground">{t.selected(count)}</span>
            <button type="button" onClick={onToggleAll} className={GHOST}>
              {allSelected ? t.clear : t.selectAll}
            </button>
            <button type="button" disabled={busy || count === 0} onClick={onDelete} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-3.5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(220,38,38,0.7)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 motion-reduce:transition-none">
              <Trash2 aria-hidden className="h-4 w-4" />
              {t.delete}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
