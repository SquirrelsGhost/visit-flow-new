import { Briefcase, ShieldCheck } from "lucide-react";
import type { StornoQuote } from "../../hooks/useStornoQuote";
import type { ConsultantLevel } from "../../lib/simulator/simulatorTypes";
import type { SettingsTone } from "../../lib/settings/settingsTones";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import SettingsRow from "../settings/SettingsRow";
import SettingsSwitchRow from "../settings/SettingsSwitchRow";
import ChoiceChip from "./ChoiceChip";
import { PAD } from "./simulatorStyles";

interface LevelGroupProps {
  level: ConsultantLevel;
  onLevel: (level: ConsultantLevel) => void;
  stornoOk: boolean;
  onToggleStorno: () => void;
  /** Echte Quote des Monats aus den Aufträgen. */
  quote?: StornoQuote;
}

const PERCENT = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

const LEVELS: readonly { value: ConsultantLevel; tone: SettingsTone }[] = [
  { value: "regulaer", tone: "blue" },
  { value: "professional", tone: "purple" },
  { value: "expert", tone: "amber" },
];

/** Ab Monat 5: Berater-Level (+10 % / +15 %) und Stornoquoten-Bonus (v1). */
export default function LevelGroup({ level, onLevel, stornoOk, onToggleStorno, quote }: LevelGroupProps) {
  return (
    <SettingsGroup label={t.level.label}>
      <div role="radiogroup" aria-label={t.level.label} className={`${PAD} grid grid-cols-3 gap-1.5`}>
        {LEVELS.map((l) => (
          <ChoiceChip key={l.value} selected={l.value === level} tone={l.tone} pillId="sim-level" onSelect={() => onLevel(l.value)}>
            {t.level.names[l.value]}
          </ChoiceChip>
        ))}
      </div>
      <SettingsSwitchRow icon={ShieldCheck} tone="green" title={t.level.storno} subtitle={t.level.stornoText} checked={stornoOk} onChange={onToggleStorno} />
      {quote !== undefined && (
        <SettingsRow
          icon={Briefcase}
          tone="orange"
          title={t.level.quoteNow}
          subtitle={quote === null ? t.level.quoteNone : t.level.quoteValue.replace("{quote}", PERCENT.format(quote))}
          href="/crm"
        />
      )}
    </SettingsGroup>
  );
}
