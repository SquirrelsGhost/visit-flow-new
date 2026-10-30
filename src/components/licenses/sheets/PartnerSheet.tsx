import { initialOf, partnerState } from "../../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../../lib/licenses/licenseTypes";
import { licenseTexts } from "../../../texts/licenseTexts";
import { fill } from "../../../texts/profileTexts";
import GlassSheet from "../../glass/GlassSheet";
import StateChip from "../StateChip";
import ConfirmStep from "./ConfirmStep";
import PersonHeader from "./PersonHeader";

interface PartnerSheetProps {
  open: boolean;
  email: string | null;
  data: TeamLicenses;
  busy: boolean;
  onClose: () => void;
  onRemove: (email: string) => Promise<boolean>;
}

const texts = licenseTexts.sheets.partner;

/** Ein eingetragener Partner: Stand ansehen und bei Bedarf austragen. */
export default function PartnerSheet({ open, email, data, busy, onClose, onRemove }: PartnerSheetProps) {
  const person = data.partners.find((p) => p.email === email);
  const name = person?.name ?? email ?? "";
  const state = partnerState(person);
  const remove = async () => {
    if (email && (await onRemove(email))) onClose();
  };
  return (
    <GlassSheet open={open} onClose={onClose} title={name} subtitle={licenseTexts.partners.label}>
      {email && (
        <>
          <PersonHeader initial={initialOf(person?.name ?? null, email)} muted={state !== "paying"} title={name} subtitle={person?.name ? email : undefined} chip={<StateChip partner={state} />} />
          <ConfirmStep label={texts.remove} question={fill(texts.removeAsk, { name })} confirmLabel={texts.removeConfirm} cancelLabel={licenseTexts.sheets.cancel} busy={busy} onConfirm={remove} />
        </>
      )}
    </GlassSheet>
  );
}
