// Aufklappmenü mit Klick-außerhalb und Escape braucht den Browser
"use client";

import { Loader2, MoreHorizontal, RefreshCw, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { abrechnungTexts as t } from "../../texts/abrechnungTexts";
import { ICON_BUTTON } from "./abrechnungStyles";

interface RecordMenuProps {
  comparing: boolean;
  onRecompare: () => void;
  onReplace: () => void;
  onDelete: () => void;
}

const ITEM = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06]";

/** Aktionen zur Abrechnung des Monats (v1 DropdownMenu): neu abgleichen, ersetzen, löschen. */
export default function RecordMenu({ comparing, onRecompare, onReplace, onDelete }: RecordMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const choose = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div ref={ref} className="relative -mr-2">
      <button type="button" className={ICON_BUTTON} aria-label={t.recordActions} aria-expanded={open} disabled={comparing} onClick={() => setOpen((v) => !v)}>
        {comparing ? <Loader2 className="h-5 w-5 animate-spin" /> : <MoreHorizontal className="h-5 w-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className="absolute right-0 bottom-12 z-20 w-60 rounded-2xl border border-slate-200 bg-white/95 p-1.5 text-slate-800 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-100"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={SNAPPY_SPRING}
          >
            <button type="button" role="menuitem" className={ITEM} onClick={choose(onRecompare)}>
              <RefreshCw className="h-4 w-4" /> {t.recompare}
            </button>
            <button type="button" role="menuitem" className={ITEM} onClick={choose(onReplace)}>
              <Upload className="h-4 w-4" /> {t.replaceFile}
            </button>
            <div className="my-1 h-px bg-slate-100 dark:bg-white/[0.06]" />
            <button type="button" role="menuitem" className={`${ITEM} text-rose-600 dark:text-rose-400`} onClick={choose(onDelete)}>
              <Trash2 className="h-4 w-4" /> {t.deleteRecord}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
