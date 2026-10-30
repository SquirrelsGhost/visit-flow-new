import type { PartnerState, SeatState } from "../../lib/licenses/licenseTypes";
import { licenseTexts } from "../../texts/licenseTexts";
import GlassChip from "../glass/GlassChip";

type StateChipProps = { seat: SeatState; partner?: never } | { partner: PartnerState; seat?: never };

const SEAT_TONE = { active: "green", pending: "amber", inactive: "slate" } as const;
const PARTNER_TONE = { paying: "green", unpaid: "slate", pending: "amber" } as const;

/** Status einer Lizenz oder eines Partners als Plakette mit Punkt. */
export default function StateChip(props: StateChipProps) {
  const tone = props.seat ? SEAT_TONE[props.seat] : PARTNER_TONE[props.partner];
  const label = props.seat ? licenseTexts.members.state[props.seat] : licenseTexts.partners.state[props.partner];
  return (
    <GlassChip tone={tone}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </GlassChip>
  );
}
