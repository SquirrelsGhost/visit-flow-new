import type { ReactNode } from "react";

interface TrendStatProps {
  label: string;
  value: ReactNode;
}

/** Kleine Kennzahl unter dem Verlauf (Summe, Durchschnitt, bester Monat). */
export default function TrendStat({ label, value }: TrendStatProps) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-slate-500 dark:text-neutral-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-slate-900 tabular-nums dark:text-white">{value}</dd>
    </div>
  );
}
