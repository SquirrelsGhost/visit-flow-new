import { cn } from "../../lib/cn";
import { MONTH_PHASES } from "../../lib/simulator/simulatorCatalog";
import { SETTINGS_TONES } from "../../lib/settings/settingsTones";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import ChoiceChip from "./ChoiceChip";
import { PAD, PHASE_LABEL } from "./simulatorStyles";

interface MonthGroupProps {
  month: number;
  onChange: (month: number) => void;
}

const GRID: Record<string, string> = { junior: "grid-cols-4", juniorPlus: "grid-cols-2", regular: "grid-cols-2" };

/** Vertragsmonat in drei Phasen: Junior (1–4) oben, Junior Plus und Regulär nebeneinander (v1). */
export default function MonthGroup({ month, onChange }: MonthGroupProps) {
  const [junior, ...rest] = MONTH_PHASES;
  const phase = (p: (typeof MONTH_PHASES)[number]) => (
    <div key={p.id}>
      <p className={cn(PHASE_LABEL, SETTINGS_TONES[p.tone].text)}>{t.month.phases[p.id]}</p>
      <div className={cn("grid gap-1.5", GRID[p.id])}>
        {p.months.map((m) => (
          <ChoiceChip key={m.value} selected={m.value === month} tone={p.tone} pillId="sim-month" onSelect={() => onChange(m.value)}>
            {m.label}
          </ChoiceChip>
        ))}
      </div>
    </div>
  );
  return (
    <SettingsGroup label={t.month.label} footer={t.month.footer}>
      <div role="radiogroup" aria-label={t.month.label} className={cn(PAD, "space-y-3")}>
        {junior && phase(junior)}
        <div className="grid grid-cols-2 gap-3">{rest.map(phase)}</div>
      </div>
    </SettingsGroup>
  );
}
