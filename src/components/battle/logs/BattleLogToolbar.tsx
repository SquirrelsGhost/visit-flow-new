import { Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { copyText, winnerStreaksText } from "../../../lib/battle/battleClipboard";
import type { StreakMap } from "../../../lib/battle/battleTypes";
import { cn } from "../../../lib/cn";
import { battleLogTexts as t } from "../../../texts/battleAdminTexts";
import { INSET, SOFT_FIELD } from "../battleStyles";
import LogDatePicker from "./LogDatePicker";

interface BattleLogToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  date: string;
  onDate: (value: string) => void;
  streaks: StreakMap;
}

/** Tag wählen, "Siegesserien kopieren" und darunter die Namenssuche. */
export default function BattleLogToolbar({ search, onSearch, date, onDate, streaks }: BattleLogToolbarProps) {
  const copyStreaks = async () => {
    const text = winnerStreaksText(streaks, date);
    if (!text) return void toast.info(t.noStreaks);
    if (await copyText(text)) toast.success(t.copied);
    else toast.error(t.copyFailed);
  };
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <LogDatePicker date={date} onDate={onDate} />
        <button
          type="button"
          onClick={copyStreaks}
          title={t.copyStreaks}
          aria-label={t.copyStreaks}
          className={cn(INSET, "flex h-11 w-11 shrink-0 items-center justify-center text-slate-500 transition-[color,background-color,transform] duration-200 hover:bg-white hover:text-red-600 active:scale-90 dark:text-neutral-400 dark:hover:text-red-300")}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <label className="relative block">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={t.search} className={cn(SOFT_FIELD, "w-full pr-3 pl-10")} />
      </label>
    </div>
  );
}
