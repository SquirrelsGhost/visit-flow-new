import { CreditCard, Settings2, UserMinus, UserPlus } from "lucide-react";
import type { TeamLicenseState } from "../../hooks/useTeamLicenses";
import type { GlassTone } from "../../lib/glass/glassTones";
import { cleanEmail, seatState } from "../../lib/licenses/licenseLogic";
import type { SeatState } from "../../lib/licenses/licenseTypes";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassRow from "../glass/GlassRow";
import { GLASS_CARD, GLASS_DIVIDER, GLASS_LABEL } from "../glass/glassStyles";

interface OrgLicenseFieldsProps {
  email?: string;
  licenses: TeamLicenseState;
}

const texts = teamsTexts.license;
const STATE: Record<SeatState, { title: string; tone: GlassTone }> = {
  active: { title: texts.active, tone: "green" },
  pending: { title: texts.pending, tone: "amber" },
  inactive: { title: texts.inactive, tone: "gray" },
};

/** Lizenz der Person (v1 Team-Lizenzen über die E-Mail): Stand ansehen, zuweisen oder entziehen, ohne die Seite zu wechseln. */
export default function OrgLicenseFields({ email, licenses }: OrgLicenseFieldsProps) {
  const { data, busy, actions } = licenses;
  if (!data) return null;
  const address = cleanEmail(email ?? "");
  const licensed = address !== "" && data.licensedEmails.includes(address);
  const state = licensed ? STATE[seatState(data.members.find((m) => m.email === address))] : { title: address ? texts.none : texts.noEmail, tone: "gray" as const };
  return (
    <section>
      <h3 className={GLASS_LABEL}>{texts.label}</h3>
      <div className={`${GLASS_CARD} ${GLASS_DIVIDER}`}>
        <GlassRow icon={CreditCard} tone={state.tone} title={state.title} subtitle={address || undefined} />
        {licensed && <GlassRow icon={UserMinus} tone="rose" title={texts.revoke} warn onClick={busy ? undefined : () => void actions.revoke(address)} />}
        {!licensed && address && <GlassRow icon={UserPlus} tone="green" title={texts.assign} subtitle={texts.assignHint} onClick={busy ? undefined : () => void actions.assign(address)} />}
        <GlassRow icon={Settings2} tone="purple" title={texts.manage} href="/subscription?licensing=true" />
      </div>
    </section>
  );
}
