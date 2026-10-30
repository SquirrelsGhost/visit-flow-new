import { LEAD_ROLES, LEAD_TONES } from "../../lib/simulator/leadCommission";
import type { LeadRole } from "../../lib/simulator/simulatorTypes";
import { simulatorTexts as t } from "../../texts/simulatorTexts";
import SettingsGroup from "../settings/SettingsGroup";
import ChoiceChip from "./ChoiceChip";
import { PAD } from "./simulatorStyles";

interface LeadRoleGroupProps {
  role: LeadRole;
  onChange: (role: LeadRole) => void;
}

/** Stufe wählen: Berater, Ausbilder, Teamleiter, Partner, jeweils mit Einstiegsschwelle (v1). */
export default function LeadRoleGroup({ role, onChange }: LeadRoleGroupProps) {
  return (
    <SettingsGroup label={t.lead.roleLabel}>
      <div role="radiogroup" aria-label={t.lead.roleLabel} className={`${PAD} grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-4`}>
        {LEAD_ROLES.map((r) => (
          <ChoiceChip key={r} selected={r === role} tone={LEAD_TONES[r]} pillId="sim-lead-role" onSelect={() => onChange(r)} className="py-2">
            <span>{t.lead.roles[r]}</span>
            <span className="text-[9.5px] font-medium opacity-80">{t.lead.roleHints[r]}</span>
          </ChoiceChip>
        ))}
      </div>
    </SettingsGroup>
  );
}
