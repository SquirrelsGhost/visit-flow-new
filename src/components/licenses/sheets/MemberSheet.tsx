import { Mail, PenLine } from "lucide-react";
import { useState } from "react";
import { emailProblem, initialOf } from "../../../lib/licenses/licenseLogic";
import type { SeatRow, TeamLicenses } from "../../../lib/licenses/licenseTypes";
import { licenseTexts } from "../../../texts/licenseTexts";
import { fill } from "../../../texts/profileTexts";
import GlassSheet from "../../glass/GlassSheet";
import StateChip from "../StateChip";
import ConfirmStep from "./ConfirmStep";
import EmailForm from "./EmailForm";
import PersonHeader from "./PersonHeader";
import SheetButton from "./SheetButton";
import SheetNote from "./SheetNote";

type MemberRow = Extract<SeatRow, { kind: "member" }>;

interface MemberSheetProps {
  open: boolean;
  row: MemberRow | null;
  data: TeamLicenses;
  busy: boolean;
  onClose: () => void;
  onReplace: (from: string, to: string) => Promise<boolean>;
  onRevoke: (email: string) => Promise<boolean>;
}

const texts = licenseTexts.sheets.member;
const sheets = licenseTexts.sheets;

/** Eine vergebene Lizenz: wer sie hat, welchen Stand sie hat; E-Mail ändern oder Lizenz entziehen. */
export default function MemberSheet({ open, row, data, busy, onClose, onReplace, onRevoke }: MemberSheetProps) {
  const [editing, setEditing] = useState(false);
  if (!row) return <GlassSheet open={false} onClose={onClose} title="">{null}</GlassSheet>;

  const validate = (email: string) => {
    const problem = emailProblem(email, data, row.email);
    return problem ? licenseTexts.errors[problem] : null;
  };
  const replace = async (email: string) => {
    const ok = await onReplace(row.email, email);
    if (ok) onClose();
    return ok;
  };
  const revoke = async () => {
    if (await onRevoke(row.email)) onClose();
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={row.name ?? row.email} subtitle={fill(licenseTexts.members.slot, { slot: row.slot })}>
      <PersonHeader initial={initialOf(row.name, row.email)} muted={row.state !== "active"} title={row.name ?? row.email} subtitle={row.name ? row.email : undefined} chip={<StateChip seat={row.state} />} />
      <SheetNote icon={Mail} tone={row.state === "active" ? "info" : "warn"}>
        {licenseTexts.members.stateText[row.state]}
      </SheetNote>
      {editing ? (
        <EmailForm label={sheets.assign.email} initial={row.email} confirmLabel={texts.changeSave} busyLabel={sheets.assign.saving} busy={busy} validate={validate} onSubmit={replace} />
      ) : (
        <SheetButton variant="secondary" icon={PenLine} label={texts.change} onClick={() => setEditing(true)} disabled={busy} />
      )}
      <ConfirmStep
        label={texts.revoke}
        question={fill(texts.revokeAsk, { name: row.name ?? row.email })}
        confirmLabel={texts.revokeConfirm}
        cancelLabel={sheets.cancel}
        busy={busy}
        onConfirm={revoke}
      />
    </GlassSheet>
  );
}
