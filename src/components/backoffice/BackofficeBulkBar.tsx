// Portal an <body> braucht den Browser
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BACKOFFICE_CAN_DELETE } from "../../lib/backoffice/backofficeConfig";
import type { BackofficeAction } from "../../lib/backoffice/backofficeTypes";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { NAV_HEIGHT } from "../../lib/navigation/navItems";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import { GLASS_POPOVER } from "../glass/glassStyles";
import BackofficeActions from "./BackofficeActions";

interface BackofficeBulkBarProps {
  open: boolean;
  count: number;
  allSelected: boolean;
  busy: boolean;
  onToggleAll: () => void;
  onAction: (action: BackofficeAction) => void;
}

const subscribeNever = () => () => {};
const GHOST = "h-10 shrink-0 rounded-xl px-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-[var(--glass-hover)] dark:text-white/70";

/** Sammelentscheidung im Auswahlmodus; schwebt über der unteren Navigation wie in der CRM-Übersicht. */
export default function BackofficeBulkBar({ open, count, allSelected, busy, onToggleAll, onAction }: BackofficeBulkBarProps) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 z-40 px-4"
          style={{ bottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 12px)` }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={SOFT_SPRING}
        >
          <div role="toolbar" aria-label={t.selected(count)} className={`${GLASS_POPOVER} mx-auto max-w-2xl space-y-2 p-2 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]`}>
            <div className="flex items-center gap-1 pl-2">
              <span className="mr-auto text-sm font-semibold tabular-nums text-foreground">{t.selected(count)}</span>
              <button type="button" onClick={onToggleAll} className={GHOST}>
                {allSelected ? t.clear : t.selectAll}
              </button>
            </div>
            <BackofficeActions solid actions={BACKOFFICE_CAN_DELETE ? ["complete", "cancel", "delete"] : ["complete", "cancel"]} disabled={busy || count === 0} onAction={onAction} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
