// Blendet die Aktionen unter der Karte mit motion ein und aus
"use client";

import { Loader2, Thermometer, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { battleTexts as t } from "../../texts/battleTexts";

interface BattleCardActionsProps {
  open: boolean;
  mine: boolean;
  cancelling: boolean;
  onCancel: () => void;
  onSick: () => void;
}

const ACTION = "glass-surface inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold transition-transform active:scale-95 disabled:opacity-60";

/** Nach langem Drücken (Leitung): Battle stornieren und, beim eigenen Battle, krank melden. */
export default function BattleCardActions({ open, mine, cancelling, onCancel, onSick }: BattleCardActionsProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="flex justify-center gap-2 pt-2.5">
            <button type="button" onClick={onCancel} disabled={cancelling} className={`${ACTION} text-red-600 dark:text-red-300`}>
              {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {t.cancelBattle}
            </button>
            {mine && (
              <button type="button" onClick={onSick} className={`${ACTION} text-amber-700 dark:text-amber-300`}>
                <Thermometer className="h-3.5 w-3.5" />
                {t.sickReport}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
