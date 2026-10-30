// Entwurf, Speichern und Entwurfsspeicher laufen im Browser
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { saveContest } from "../../../lib/overview/contestApi";
import { contestFromDraft, emptyDraft, goalCategories, readDraft, validateDraft, writeDraft, type ContestDraft, type ContestOwnScope } from "../../../lib/overview/contestForm";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { contestFormTexts as texts } from "../../../texts/contestFormTexts";
import GlassSheet from "../../glass/GlassSheet";
import { GLASS_BUTTON, GLASS_FIELD, GLASS_LABEL } from "../../glass/glassStyles";
import ContestGoalFields from "./ContestGoalFields";
import ContestModeField from "./ContestModeField";
import ContestPrizeFields from "./ContestPrizeFields";
import ContestWhoField from "./ContestWhoField";

interface ContestFormSheetProps {
  open: boolean;
  /** Zu bearbeitendes Gewinnspiel als Entwurf; ohne ein neues (mit gespeichertem Entwurf aus dem letzten Mal). */
  initial: ContestDraft | null;
  vertical: Vertical;
  teamId: string;
  userId: string;
  users: readonly TeamUser[];
  solar: boolean;
  onClose: () => void;
  /** Gewinnspiel nur für die eigene Gruppe oder die Mentees. */
  own?: ContestOwnScope;
}

/** Gewinnspiel anlegen oder bearbeiten (v1 CreateContestDialog) als Glas-Sheet. */
export default function ContestFormSheet({ open, initial, vertical, teamId, userId, users, solar, onClose, own }: ContestFormSheetProps) {
  const [restored] = useState(() => (initial ? null : readDraft()));
  const [draft, setDraft] = useState<ContestDraft>(() => initial ?? restored ?? emptyDraft(vertical));
  const [busy, setBusy] = useState(false);
  const change = (next: Partial<ContestDraft>) => setDraft((d) => ({ ...d, ...next }));

  // Entwurf neuer Gewinnspiele überlebt Schließen und Neuladen wie in v1
  useEffect(() => {
    if (!draft.id) writeDraft(draft);
  }, [draft]);

  const submit = async () => {
    const error = validateDraft(draft, own);
    if (error) return void toast.error(error);
    setBusy(true);
    const ok = await saveContest(contestFromDraft(draft, teamId, userId, new Date(), own), vertical).catch(() => false);
    setBusy(false);
    if (!ok) return void toast.error(texts.failed);
    writeDraft(null);
    toast.success(draft.id ? texts.updated : texts.created);
    onClose();
  };

  const discard = () => {
    writeDraft(null);
    setDraft(emptyDraft(vertical));
  };

  return (
    <GlassSheet open={open} onClose={onClose} title={draft.id ? texts.editTitle : texts.createTitle} subtitle={restored ? texts.draftRestored : texts.hint}>
      <section className="space-y-2">
        <h3 className={GLASS_LABEL}>{texts.name}</h3>
        <input value={draft.name} onChange={(e) => change({ name: e.target.value })} placeholder={texts.namePlaceholder} aria-label={texts.name} maxLength={60} className={GLASS_FIELD} />
        <textarea value={draft.description} onChange={(e) => change({ description: e.target.value })} placeholder={texts.description} aria-label={texts.description} rows={2} maxLength={240} className={`${GLASS_FIELD} h-auto resize-none py-3`} />
      </section>
      <ContestModeField mode={draft.contestType} onChange={(contestType) => change({ contestType })} />
      {!own && <ContestWhoField draft={draft} users={users} solar={solar} onChange={change} />}
      <ContestGoalFields categories={goalCategories(vertical)} targets={draft.targets} onChange={(targets) => change({ targets })} />
      <ContestPrizeFields prizes={draft.prizes} onChange={(prizes) => change({ prizes })} />
      <section>
        <h3 className={GLASS_LABEL}>{texts.period}</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" aria-label={texts.start} value={draft.start} onChange={(e) => change({ start: e.target.value })} className={`${GLASS_FIELD} px-3 dark:[color-scheme:dark]`} />
          <input type="date" aria-label={texts.end} value={draft.end} min={draft.start} onChange={(e) => change({ end: e.target.value })} className={`${GLASS_FIELD} px-3 dark:[color-scheme:dark]`} />
        </div>
      </section>
      <button type="button" disabled={busy} onClick={submit} className={GLASS_BUTTON}>
        {draft.id ? texts.submitEdit : texts.submitCreate}
      </button>
      {!draft.id && (
        <button type="button" onClick={discard} className="mx-auto block py-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground">
          {texts.discard}
        </button>
      )}
    </GlassSheet>
  );
}
