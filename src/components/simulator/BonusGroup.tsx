import type { BonusResult } from "../../lib/simulator/telcoBonus";
import { fill } from "../../texts/profileTexts";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import BonusTierRow from "./BonusTierRow";

interface BonusGroupProps {
  month: number;
  bonus: BonusResult;
}

/** Bonus-Staffeln des gewählten Vertragsmonats mit Fortschritt (v1 "Bonus-Staffeln"). */
export default function BonusGroup({ month, bonus }: BonusGroupProps) {
  return (
    <SettingsGroup label={fill(t.bonus.label, { month })}>
      {bonus.rows.map((row) => (
        <BonusTierRow key={row.category.id} row={row} />
      ))}
    </SettingsGroup>
  );
}
