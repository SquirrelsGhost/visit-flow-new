import { Gift, UserPlus } from "lucide-react";
import { initialOf, partnerCredit, partnerState } from "../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../lib/licenses/licenseTypes";
import { eur } from "../../lib/tariff/eur";
import { licenseTexts } from "../../texts/licenseTexts";
import { fill } from "../../texts/profileTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import PersonRow from "./PersonRow";
import StateChip from "./StateChip";

interface PartnerSectionProps {
  data: TeamLicenses;
  onAdd: () => void;
  onOpen: (email: string) => void;
}

const texts = licenseTexts.partners;

/** Selbstzahlende Partner (v1 Reiter "Partner (Selbstzahler)") als eigene, ruhige Gruppe. */
export default function PartnerSection({ data, onAdd, onOpen }: PartnerSectionProps) {
  const credit = partnerCredit(data);
  const paying = data.partners.filter((p) => partnerState(p) === "paying").length;
  return (
    <GlassSection label={texts.label} footer={texts.footer}>
      {data.partnerEmails.map((email) => {
        const person = data.partners.find((p) => p.email === email);
        const state = partnerState(person);
        const name = person?.name ?? null;
        return (
          <PersonRow
            key={email}
            initial={initialOf(name, email)}
            muted={state !== "paying"}
            title={name ?? email}
            subtitle={name ? email : undefined}
            chip={<StateChip partner={state} />}
            onClick={() => onOpen(email)}
          />
        );
      })}
      {credit > 0 && <GlassRow icon={Gift} tone="green" title={texts.credit} subtitle={fill(texts.creditText, { count: paying, rate: Math.round(data.creditRate * 100) })} value={`−${eur(credit)}`} />}
      <GlassRow icon={UserPlus} tone="purple" title={texts.add} subtitle={texts.addText} onClick={onAdd} />
    </GlassSection>
  );
}
