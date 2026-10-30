import { ChevronDown } from "lucide-react";
import type { PlayerGroups } from "../../../lib/battle/battleSelectors";
import { cn } from "../../../lib/cn";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import { SOFT_FIELD, initial } from "../battleStyles";

interface PlayerSelectProps {
  value: string;
  placeholder: string;
  groups: PlayerGroups;
  onChange: (id: string) => void;
}

const GROUPS = [
  ["available", `🟢 ${t.groupAvailable}`],
  ["inBattle", `⚔️ ${t.groupInBattle}`],
  ["unavailable", `⛔ ${t.groupUnavailable}`],
] as const;

/**
 * Spielerauswahl mit den Gruppen aus v1 (Verfügbar, Bereits im Battle, Nicht Verfügbar).
 * Bewusst die native Auswahl: auf dem Handy öffnet sich die gewohnte Systemliste. Links steht das Kürzel der gewählten Person.
 */
export default function PlayerSelect({ value, placeholder, groups, onChange }: PlayerSelectProps) {
  const name = [...groups.available, ...groups.inBattle, ...groups.unavailable].find((u) => u.id === value)?.name;
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-300",
          name ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_4px_12px_-4px_rgba(220,38,38,0.6)]" : "bg-slate-100 text-slate-400 dark:bg-white/5",
        )}
      >
        {name ? initial(name) : "?"}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(SOFT_FIELD, "h-12 w-full appearance-none pr-10 pl-[3.25rem] font-medium dark:[color-scheme:dark]", !value && "text-slate-400 dark:text-neutral-500")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {GROUPS.map(([key, label]) =>
          key === "available" || groups[key].length > 0 ? (
            <optgroup key={key} label={label}>
              {groups[key].map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </optgroup>
          ) : null,
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
