import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "../../lib/profile/profileApi";
import { passwordError, type PasswordDraft } from "../../lib/profile/profileRules";
import { profileTexts } from "../../texts/profileTexts";
import SettingsActionButton from "../settings/SettingsActionButton";
import SettingsExpandRow from "../settings/SettingsExpandRow";
import SettingsField from "../settings/SettingsField";
import FormError from "./FormError";

const texts = profileTexts.security;
const EMPTY: PasswordDraft = { current: "", next: "", confirm: "" };

/**
 * Passwort ändern über PATCH /auth/change-password. v1 schickte das neue Passwort ohne das aktuelle mit
 * dem Profil; v2 fragt das aktuelle ab, damit ein offenes Gerät allein nicht reicht.
 */
export interface PasswordRowProps { readonly _?: never; }

export default function PasswordRow() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const type = visible ? "text" : "password";
  const bind = (key: keyof PasswordDraft) => ({ type, value: draft[key], onChange: (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [key]: e.target.value })) });

  const toggle = (next: boolean) => {
    setDraft(EMPTY);
    setError(null);
    setVisible(false);
    setOpen(next);
  };

  const save = async () => {
    const problem = passwordError(draft);
    setError(problem);
    if (problem) return;
    setBusy(true);
    const result = await changePassword(draft.current, draft.next);
    setBusy(false);
    if (!result.ok) return setError(result.message ?? profileTexts.rules.saveFailed);
    toast.success(texts.changed);
    toggle(false);
  };

  return (
    <SettingsExpandRow icon={KeyRound} tone="red" title={texts.password} subtitle={texts.passwordText} open={open} onOpenChange={toggle}>
      <SettingsField label={texts.current} autoComplete="current-password" {...bind("current")} />
      <SettingsField label={texts.next} autoComplete="new-password" {...bind("next")} />
      <SettingsField label={texts.confirm} autoComplete="new-password" {...bind("confirm")} />
      <button type="button" onClick={() => setVisible(!visible)} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {visible ? texts.hide : texts.show}
      </button>
      <FormError message={error} />
      <SettingsActionButton icon={Lock} label={texts.change} busyLabel={texts.changing} busy={busy} onClick={save} />
    </SettingsExpandRow>
  );
}
