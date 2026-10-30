import type { SaleDetail } from "../../../lib/battle/battleTypes";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";

interface BattleLogSalesProps {
  name: string;
  sales: SaleDetail[] | undefined;
}

const time = (ts: string) => new Date(ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

/** Aufgeklappte Sales einer Seite als kleine Zeitleiste (Uhrzeit und Tarif). */
export default function BattleLogSales({ name, sales }: BattleLogSalesProps) {
  return (
    <div className="min-w-0">
      <h5 className="mb-2 truncate text-[12px] font-semibold text-slate-500 dark:text-neutral-400">{t.salesOf(name)}</h5>
      {!sales || sales.length === 0 ? (
        <p className="text-[13px] text-slate-400 italic dark:text-neutral-500">{t.noSales}</p>
      ) : (
        <ol className="relative space-y-2 border-l border-red-200 pl-3 dark:border-red-500/25">
          {sales.map((s, i) => (
            <li key={`${s.timestamp}-${i}`} className="relative text-[13px]">
              <span className="absolute top-1.5 -left-[16.5px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-900" />
              <span className="mr-2 font-mono text-[11px] text-slate-400 tabular-nums">{time(s.timestamp)}</span>
              <span className="font-medium text-slate-700 dark:text-neutral-200">{s.type}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
