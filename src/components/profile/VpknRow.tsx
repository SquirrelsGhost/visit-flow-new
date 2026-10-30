import { Check, Hash } from "lucide-react";
import { useState } from "react";
import type { SaveProfile } from "../../lib/profile/profileTypes";
import { profileTexts } from "../../texts/profileTexts";
import SettingsActionButton from "../settings/SettingsActionButton";
import SettingsExpandRow from "../settings/SettingsExpandRow";
import SettingsField from "../settings/SettingsField";

interface VpknRowProps {
  vpkn?: string;
  onSave: SaveProfile;
}

const texts = profileTexts.role;

/** Vodafone-Partnerkennung (nur Telco, v1 Reiter Rolle). */
export default function VpknRow({ vpkn, onSave }: VpknRowProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(vpkn ?? "");
  const [busy, setBusy] = useState(false);
  const value = draft.trim().toUpperCase();

  const toggle = (next: boolean) => {
    if (next) setDraft(vpkn ?? "");
    setOpen(next);
  };

  const save = async () => {
    if (!value) return;
    setBusy(true);
    const ok = await onSave({ vpkn: value }, texts.vpknSaved);
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <SettingsExpandRow icon={Hash} tone="purple" title={texts.vpkn} value={vpkn ?? texts.vpknEmpty} open={open} onOpenChange={toggle}>
      <SettingsField label={texts.vpkn} placeholder={texts.vpknPlaceholder} autoCapitalize="characters" autoCorrect="off" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <SettingsActionButton icon={Check} label={profileTexts.personal.save} busyLabel={profileTexts.personal.saving} busy={busy} onClick={save} />
    </SettingsExpandRow>
  );
}
