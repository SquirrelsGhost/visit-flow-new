// Schalter-Knopf gleitet mit Feder
"use client";

import { Clock } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { GLIDE, ICON_TILE, INSET } from "../battleStyles";

interface CronToggleProps {
  on: boolean;
  busy: boolean;
  onToggle: () => void;
}

/** Tägliche Auto-Zuweisung Mo–Sa um 12 Uhr an/aus, als ruhige Einstellungszeile mit Schalter. */
export default function CronToggle({ on, busy, onToggle }: CronToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy}
      onClick={onToggle}
      className={cn(INSET, "group flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-[background-color,box-shadow] active:scale-[0.99] disabled:opacity-60", GLIDE)}
    >
      <span
        className={cn(
          ICON_TILE,
          "h-9 w-9 transition-colors",
          GLIDE,
          on ? "bg-emerald-500/12 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400" : "bg-card text-slate-400 ring-slate-200 dark:bg-white/5 dark:ring-white/10",
        )}
      >
        <Clock className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t.cronTitle}</span>
        <span className="mt-0.5 block text-[12px] text-slate-500 dark:text-neutral-400">{t.cronHint}</span>
      </span>
      <span
        className={cn(
          "relative flex h-[30px] w-[52px] shrink-0 rounded-full p-[3px] transition-[background-color,box-shadow]",
          GLIDE,
          on ? "justify-end bg-emerald-500 shadow-[0_6px_16px_-6px_rgba(16,185,129,0.7)]" : "justify-start bg-slate-300 dark:bg-neutral-700",
        )}
      >
        <motion.span layout transition={SNAPPY_SPRING} className="h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.25)]" />
      </span>
    </button>
  );
}
