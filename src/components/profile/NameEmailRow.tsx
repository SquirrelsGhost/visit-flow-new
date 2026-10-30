import { Check, UserRound } from "lucide-react";
import { useState } from "react";
import { emailError } from "../../lib/profile/profileRules";
import { profileTexts } from "../../texts/profileTexts";
import SettingsActionButton from "../settings/SettingsActionButton";
import SettingsExpandRow from "../settings/SettingsExpandRow";
import SettingsField from "../settings/SettingsField";
import FormError from "./FormError";
import type { SaveProfile } from "../../lib/profile/profileTypes";

interface NameEmailRowProps {
  name: string;
  email: string;
  onSave: SaveProfile;
}

const texts = profileTexts.personal;

/** Name und E-Mail (v1 Reiter Persönlich, "Bearbeiten"): aufklappen, ändern, speichern. */
export default function NameEmailRow({ name, email, onSave }: NameEmailRowProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name, email });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (next: boolean) => {
    if (next) setDraft({ name, email });
    setError(null);
    setOpen(next);
  };

  const save = async () => {
    const next = { name: draft.name.trim(), email: draft.email.trim().toLowerCase() };
    const problem = next.name ? emailError(next.email) : profileTexts.rules.nameEmpty;
    setError(problem);
    if (problem) return;
    setBusy(true);
    const ok = await onSave(next, texts.saved);
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <SettingsExpandRow icon={UserRound} tone="blue" title={texts.nameEmailTitle} subtitle={`${name} · ${email}`} open={open} onOpenChange={toggle}>
      <SettingsField label={texts.name} autoComplete="name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
      <SettingsField label={texts.email} type="email" autoComplete="email" inputMode="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
      <FormError message={error} />
      <SettingsActionButton icon={Check} label={texts.save} busyLabel={texts.saving} busy={busy} onClick={save} />
    </SettingsExpandRow>
  );
}
