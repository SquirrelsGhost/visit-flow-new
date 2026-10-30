import { LEAD_ROLES, LEAD_TONES } from "../../lib/simulator/leadCommission";
import type { LeadRole } from "../../lib/simulator/simulatorTypes";
import { LEAD_MODEL, simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import LeadModelRow from "./LeadModelRow";

interface LeadModelGroupProps {
  role: LeadRole;
}

/** Vergütungsmodell aller Stufen und die 100-Nettos-Regel als Fußnote. */
export default function LeadModelGroup({ role }: LeadModelGroupProps) {
  return (
    <SettingsGroup label={t.lead.modelLabel} footer={t.lead.rule}>
      {LEAD_ROLES.map((r, i) => (
        <LeadModelRow key={r} index={i} model={LEAD_MODEL[r]} tone={LEAD_TONES[r]} current={r === role} />
      ))}
    </SettingsGroup>
  );
}
