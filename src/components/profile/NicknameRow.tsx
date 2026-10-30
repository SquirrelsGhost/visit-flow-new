import { AtSign, Check } from "lucide-react";
import { useState } from "react";
import { NICKNAME_COOLDOWN_DAYS, NICKNAME_MAX, nicknameDaysLeft, nicknameError } from "../../lib/profile/profileRules";
import { fill, profileTexts } from "../../texts/profileTexts";
import SettingsActionButton from "../settings/SettingsActionButton";
import SettingsExpandRow from "../settings/SettingsExpandRow";
import SettingsField from "../settings/SettingsField";
import FormError from "./FormError";
import type { SaveProfile } from "../../lib/profile/profileTypes";

interface NicknameRowProps {
  nickname?: string;
  changedAt?: string;
  onSave: SaveProfile;
}

const texts = profileTexts.personal;
const DAY = 86_400_000;

function cooldownText(changedAt: string | undefined): string | null {
  const days = nicknameDaysLeft(changedAt);
  if (!days || !changedAt) return null;
  const date = new Date(new Date(changedAt).getTime() + NICKNAME_COOLDOWN_DAYS * DAY).toLocaleDateString("de-DE");
  return fill(texts.nicknameCooldown, { days, date });
}

/** Nickname fürs Leaderboard (v1 Nickname-Dialog) mit den Regeln des Servers; gesperrt in den 7 Tagen nach einer Änderung. */
export default function NicknameRow({ nickname, changedAt, onSave }: NicknameRowProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(nickname ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cooldown = cooldownText(changedAt);

  const toggle = (next: boolean) => {
    if (next) setDraft(nickname ?? "");
    setError(null);
    setOpen(next);
  };

  const save = async () => {
    const problem = nicknameError(draft);
    setError(problem);
    if (problem) return;
    setBusy(true);
    const value = draft.trim().toLowerCase();
    const ok = await onSave({ nickname: value, nicknameLastChangedAt: new Date().toISOString() }, fill(texts.nicknameSaved, { nickname: value }));
    setBusy(false);
    if (ok) setOpen(false);
  };

  return (
    <SettingsExpandRow icon={AtSign} tone="purple" title={texts.nickname} subtitle={nickname ? `@${nickname}` : texts.nicknameEmpty} open={open} onOpenChange={toggle}>
      <p className="text-[12px] leading-snug text-muted-foreground">{texts.nicknameHint}</p>
      {cooldown ? (
        <p className="rounded-xl bg-amber-500/10 px-3 py-2.5 text-[13px] font-medium text-amber-800 dark:text-amber-200">{cooldown}</p>
      ) : (
        <>
          <div className="relative">
            <SettingsField
              label={texts.nickname}
              className="pr-14"
              autoCapitalize="none"
              autoCorrect="off"
              maxLength={NICKNAME_MAX}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value.replace(/\s/g, ""));
                setError(/\s/.test(e.target.value) ? profileTexts.rules.nicknameSpaces : null);
              }}
            />
            <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground">
              {draft.length}/{NICKNAME_MAX}
            </span>
          </div>
          <FormError message={error} />
          <SettingsActionButton icon={Check} label={texts.save} busyLabel={texts.saving} busy={busy} onClick={save} />
        </>
      )}
    </SettingsExpandRow>
  );
}
