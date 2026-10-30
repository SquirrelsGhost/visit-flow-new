import { emailProblem } from "../../../lib/licenses/licenseLogic";
import type { TeamLicenses } from "../../../lib/licenses/licenseTypes";
import { licenseTexts } from "../../../texts/licenseTexts";
import GlassSheet from "../../glass/GlassSheet";
import EmailForm from "./EmailForm";

interface PartnerAddSheetProps {
  open: boolean;
  data: TeamLicenses;
  busy: boolean;
  onClose: () => void;
  onAdd: (email: string) => Promise<boolean>;
}

const texts = licenseTexts.sheets.partner;

/** Selbstzahlenden Partner per E-Mail eintragen (v1 "Partner hinzufügen"). */
export default function PartnerAddSheet({ open, data, busy, onClose, onAdd }: PartnerAddSheetProps) {
  const validate = (email: string) => {
    const problem = emailProblem(email, data);
    return problem ? licenseTexts.errors[problem] : null;
  };
  const submit = async (email: string) => {
    const ok = await onAdd(email);
    if (ok) onClose();
    return ok;
  };
  return (
    <GlassSheet open={open} onClose={onClose} title={texts.title} subtitle={texts.text}>
      <EmailForm label={licenseTexts.sheets.assign.email} confirmLabel={texts.confirm} busyLabel={licenseTexts.sheets.assign.saving} busy={busy} validate={validate} onSubmit={submit} />
    </GlassSheet>
  );
}
