import { Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/cn";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import { ACTION_BUTTON, FIELD } from "../settings/settingsStyles";
import { CHIP, CHIP_IDLE, PAD } from "./simulatorStyles";

interface AutopilotGroupProps {
  footer: string;
  /** false, wenn keine passenden Tarife da sind */
  onRun: (target: number) => boolean;
}

const QUICK_TARGETS = [10, 15, 20] as const;

/** Ziel eingeben, der Simulator stellt den passenden Warenkorb zusammen (v1 "Ziel-Umsatz Auto-Pilot"). */
export default function AutopilotGroup({ footer, onRun }: AutopilotGroupProps) {
  const [value, setValue] = useState("");
  const run = (target: number) => {
    if (!(target > 0)) return;
    if (!onRun(target)) toast.error(t.autopilot.none);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(Number(value.replace(/\./g, "").replace(",", ".")));
  };
  return (
    <SettingsGroup label={t.autopilot.label} footer={footer}>
      <form onSubmit={submit} className={cn(PAD, "space-y-2.5")}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              inputMode="decimal"
              aria-label={t.autopilot.aria}
              placeholder={t.autopilot.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={cn(FIELD, "pr-8 tabular-nums")}
            />
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">
              €
            </span>
          </div>
          <button type="submit" className={cn(ACTION_BUTTON, "w-auto px-4")}>
            <Sparkles aria-hidden className="h-4 w-4" />
            {t.autopilot.run}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {QUICK_TARGETS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setValue(String(k * 1000));
                run(k * 1000);
              }}
              className={cn(CHIP, CHIP_IDLE, "active:scale-95")}
            >
              {fill(t.autopilot.chip, { k })}
            </button>
          ))}
        </div>
      </form>
    </SettingsGroup>
  );
}
