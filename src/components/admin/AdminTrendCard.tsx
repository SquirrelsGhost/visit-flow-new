// Der angetippte Tag ist lokaler State
"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { AdminDay } from "../../lib/admin/adminTypes";
import { cn } from "../../lib/cn";
import { niceMax } from "../../lib/team/chartPath";
import { adminTexts } from "../../texts/adminTexts";
import { fill } from "../../texts/profileTexts";
import AdminPanel from "./AdminPanel";

interface AdminTrendCardProps {
  days: readonly AdminDay[];
}

const texts = adminTexts.trend;
const SHORT = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" });
const LONG = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" });
const parse = (date: string) => new Date(`${date}T12:00:00`);
const EASE = [0.16, 1, 0.3, 1] as const;

/** Abschlüsse der letzten zwei Wochen als Säulen; heute leuchtet rot, ein Tipp zeigt den Tag. */
export default function AdminTrendCard({ days }: AdminTrendCardProps) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<number | null>(null);
  const max = niceMax(Math.max(...days.map((d) => d.sales), 1));
  const total = days.reduce((sum, d) => sum + d.sales, 0);
  const last = days.length - 1;
  const picked = focus !== null ? days[focus] : undefined;

  return (
    <AdminPanel label={fill(texts.title, { days: days.length })}>
      <div className="min-h-[3.25rem]" aria-live="polite">
        <p className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">{picked ? picked.sales : total}</p>
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">{picked ? LONG.format(parse(picked.date)) : fill(texts.total, { count: total, days: days.length })}</p>
      </div>
      <div role="img" aria-label={fill(texts.aria, { days: days.length })} className="relative mt-4 h-36" onPointerLeave={() => setFocus(null)}>
        {[0.5, 1].map((f) => (
          <span key={f} aria-hidden className="absolute inset-x-0 border-t border-dashed border-slate-300/60 dark:border-white/[0.07]" style={{ bottom: `${f * 100}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-1 border-b border-slate-300 sm:gap-1.5 dark:border-white/15">
          {days.map((day, i) => {
            const today = i === last;
            const share = day.sales / max;
            return (
              <button
                key={day.date}
                type="button"
                aria-label={`${LONG.format(parse(day.date))}: ${day.sales}`}
                onPointerEnter={() => setFocus(i)}
                onFocus={() => setFocus(i)}
                onClick={() => setFocus(focus === i ? null : i)}
                className="no-touch-target-fix group relative flex h-full min-w-0 flex-1 items-end focus:outline-none"
              >
                <motion.span
                  className={cn(
                    "block w-full origin-bottom rounded-t-[7px] bg-gradient-to-t transition-[filter,opacity] duration-200",
                    today ? "from-red-600 to-rose-400 shadow-[0_0_18px_-4px_rgba(244,63,94,0.7)]" : "from-indigo-500/55 to-sky-400/60 dark:from-indigo-400/45 dark:to-sky-300/45",
                    focus !== null && focus !== i && "opacity-45",
                  )}
                  style={{ height: `${Math.max(share * 100, day.sales > 0 ? 4 : 1.5)}%` }}
                  initial={{ scaleY: reduce ? 1 : 0 }}
                  animate={{ scaleY: 1 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.03 }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400 dark:text-white/40">
        <span>{days[0] ? SHORT.format(parse(days[0].date)) : ""}</span>
        <span>{days[Math.floor(last / 2)] ? SHORT.format(parse(days[Math.floor(last / 2)]!.date)) : ""}</span>
        <span className="text-red-500 dark:text-red-400">{texts.today}</span>
      </div>
    </AdminPanel>
  );
}
