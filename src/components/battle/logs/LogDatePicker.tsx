// Öffnet die native Kalenderauswahl per showPicker()
"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { dayKey } from "../../../lib/battle/arenaScore";
import { dayLabel, shiftDay } from "../../../lib/battle/battleLogs";
import { cn } from "../../../lib/cn";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";
import { INSET } from "../battleStyles";

interface LogDatePickerProps {
  date: string;
  onDate: (value: string) => void;
}

const ARROW =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-red-600 hover:shadow-sm active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-red-300";

/** Tag der Historie: mit Pfeilen blättern oder antippen für den Kalender. Die Zukunft ist gesperrt. */
export default function LogDatePicker({ date, onDate }: LogDatePickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const today = dayKey(new Date());
  const full = new Date(`${date}T12:00:00Z`).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  const label = dayLabel(date, today, t);
  // Bei "Heute"/"Gestern" steht das Datum klein daneben, sonst trägt das Label es schon
  const named = label === t.today || label === t.yesterday;
  const short = new Date(`${date}T12:00:00Z`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: named ? "numeric" : undefined, timeZone: "UTC" });
  const openPicker = () => {
    try {
      input.current?.showPicker();
    } catch {
      input.current?.focus();
    }
  };
  return (
    <div className={cn(INSET, "flex min-w-0 flex-1 items-center gap-1 p-1")}>
      <button type="button" aria-label={t.prevDay} onClick={() => onDate(shiftDay(date, -1))} className={ARROW}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button type="button" onClick={openPicker} aria-label={`${t.pickDate}: ${full}`} className="relative flex h-9 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl">
        <Calendar className="h-4 w-4 shrink-0 text-red-500 dark:text-red-300" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={date}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 items-baseline gap-1.5"
          >
            <span className="text-sm font-semibold whitespace-nowrap text-slate-900 dark:text-white">{label}</span>
            {named && <span className="truncate text-[12px] text-slate-400 tabular-nums dark:text-neutral-500">{short}</span>}
          </motion.span>
        </AnimatePresence>
        <input
          ref={input}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={date}
          max={today}
          onChange={(e) => e.target.value && onDate(e.target.value)}
          className="pointer-events-none absolute inset-0 opacity-0"
        />
      </button>
      <button type="button" aria-label={t.nextDay} disabled={date >= today} onClick={() => onDate(shiftDay(date, 1))} className={ARROW}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
