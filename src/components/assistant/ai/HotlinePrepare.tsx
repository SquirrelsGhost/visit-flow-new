import type { PrepareOption } from "../../../lib/assistant/hotline";
import { cn } from "../../../lib/cn";

/** Gelber Hinweis "Vor dem Anruf bereithalten" mit den Wegen zur Legitimation (v1). */
export interface HotlinePrepareProps { title: string; options: readonly PrepareOption[] }

export default function HotlinePrepare({ title, options }: HotlinePrepareProps) {
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5 md:px-4 dark:border-amber-800 dark:bg-amber-950/20">
      <p className="mb-2 text-xs font-bold text-amber-700 md:text-sm dark:text-amber-300">{title}</p>
      <ul className="space-y-1.5">
        {options.map((option) => (
          <li key={option.mark} className={cn("flex items-start gap-2", option.fallback && "mt-1 border-t border-amber-200/60 pt-1 dark:border-amber-700/40")}>
            <span
              className={cn(
                "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold md:h-5 md:w-5 md:text-[10px]",
                option.fallback ? "bg-red-200 text-red-800 dark:bg-red-800/40 dark:text-red-200" : "bg-amber-200 text-amber-800 dark:bg-amber-800/40 dark:text-amber-200",
              )}
            >
              {option.mark}
            </span>
            <p className="text-[11px] leading-snug text-amber-800 md:text-xs md:leading-relaxed dark:text-amber-200">
              <strong>{option.strong}</strong>
              {option.rest}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
