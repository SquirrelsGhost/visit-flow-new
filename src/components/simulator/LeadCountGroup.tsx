import { Target } from "lucide-react";
import type { LeadSimulator } from "../../hooks/useLeadSimulator";
import { cn } from "../../lib/cn";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import { FIELD } from "../settings/settingsStyles";
import { CHIP, CHIP_IDLE, MONEY, PAD } from "./simulatorStyles";

interface LeadCountGroupProps {
  sim: LeadSimulator;
}

const QUICK = [150, 200] as const;
const ACCENT = { berater: "accent-amber-500", ausbilder: "accent-green-500", teamleiter: "accent-blue-500", partner: "accent-purple-500" } as const;

/** Anzahl Netto-Leads: Zahl eintippen oder schieben; Berater haben Schnellwahl für die Aufstiegsziele (v1). */
export default function LeadCountGroup({ sim }: LeadCountGroupProps) {
  const { role, count, limits } = sim;
  const label = role === "berater" ? t.lead.countOwn : t.lead.countTeam;
  const slider = Math.min(limits.max, Math.max(limits.min, count));
  return (
    <SettingsGroup label={label}>
      <div className={cn(PAD, "space-y-3")}>
        <div className="flex items-center gap-3">
          <input
            type="range"
            aria-label={t.lead.countAria}
            min={limits.min}
            max={limits.max}
            step={limits.step}
            value={slider}
            onChange={(e) => sim.setCount(Number(e.target.value))}
            className={cn("h-2 flex-1 cursor-pointer", ACCENT[role])}
          />
          <input
            type="number"
            inputMode="numeric"
            aria-label={label}
            value={count === 0 ? "" : count}
            onChange={(e) => sim.setCount(Number.parseInt(e.target.value, 10) || 0)}
            onBlur={sim.commitCount}
            className={cn(FIELD, "h-10 w-24 text-center font-semibold", MONEY)}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
          <span>{limits.min.toLocaleString("de-DE")}</span>
          <span>{limits.max.toLocaleString("de-DE")}</span>
        </div>
        {role === "berater" && (
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK.map((n) => (
              <button key={n} type="button" onClick={() => sim.setCount(n)} className={cn(CHIP, CHIP_IDLE, "text-[12px] active:scale-95")}>
                <Target aria-hidden className="h-3.5 w-3.5" />
                {t.lead.quick[n]}
              </button>
            ))}
          </div>
        )}
      </div>
    </SettingsGroup>
  );
}
