const ROWS = [0, 1, 2] as const;
const BAR = "rounded-full bg-slate-200/80 dark:bg-white/[0.06]";

/** Platzhalter, solange die Historie lädt; pulsiert nur ohne reduzierte Bewegung. */
export interface BattleLogSkeletonProps { readonly _?: never; }

export default function BattleLogSkeleton() {
  return (
    <ul aria-busy="true" className="space-y-2.5">
      {ROWS.map((i) => (
        <li key={i} className="glass-surface grid animate-pulse grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[24px] px-4 py-4 ring-1 ring-slate-200/70 motion-reduce:animate-none dark:bg-white/[0.03] dark:ring-white/[0.07]">
          <span className="flex flex-col items-center gap-2">
            <span className="h-10 w-10 rounded-full bg-slate-200/80 dark:bg-white/[0.06]" />
            <span className={`${BAR} h-2.5 w-20`} />
          </span>
          <span className={`${BAR} h-6 w-14`} />
          <span className="flex flex-col items-center gap-2">
            <span className="h-10 w-10 rounded-full bg-slate-200/80 dark:bg-white/[0.06]" />
            <span className={`${BAR} h-2.5 w-20`} />
          </span>
        </li>
      ))}
    </ul>
  );
}
