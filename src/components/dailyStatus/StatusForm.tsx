import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import { DAILY_STATUSES } from "../../lib/team/dailyStatus";
import type { StatusDraft } from "../../lib/team/statusPayload";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import { fill } from "../../texts/profileTexts";
import { GLASS_BUTTON, GLASS_LABEL } from "../glass/glassStyles";
import StatusDetails from "./StatusDetails";
import StatusOption from "./StatusOption";

interface StatusFormProps {
  draft: StatusDraft;
  onChange: (draft: StatusDraft) => void;
  isLeader: boolean;
  /** Name, wenn eine Leitung den Status eines Teammitglieds bearbeitet. */
  otherName?: string;
  saving: boolean;
  onSave: () => void;
  onBackToMe: () => void;
}

const REVEAL = { duration: 0.35, ease: [0.22, 1, 0.36, 1] } as const;

/** Statuswahl als vier Kacheln; bei einer Abwesenheit klappen Grund und Zeitraum weich darunter auf. */
export default function StatusForm({ draft, onChange, isLeader, otherName, saving, onSave, onBackToMe }: StatusFormProps) {
  return (
    <motion.section variants={riseIn} aria-labelledby="daily-status-choose">
      <h3 id="daily-status-choose" className={GLASS_LABEL}>
        {otherName ? fill(texts.chooseFor, { name: otherName }) : texts.choose}
      </h3>
      <div role="radiogroup" aria-labelledby="daily-status-choose" className="grid grid-cols-2 gap-3">
        {DAILY_STATUSES.map((status) => (
          <StatusOption key={status} status={status} selected={draft.status === status} onSelect={(next) => onChange({ ...draft, status: next })} />
        ))}
      </div>
      <AnimatePresence initial={false}>
        {draft.status !== "active" && (
          <motion.div key="details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={REVEAL} className="overflow-hidden">
            <div className="pt-3">
              <StatusDetails draft={draft} onChange={onChange} isLeader={isLeader} forOther={Boolean(otherName)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4 space-y-2">
        <button type="button" onClick={onSave} disabled={saving} className={GLASS_BUTTON}>
          {saving && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {saving ? texts.saving : texts.save}
        </button>
        {otherName && (
          <button type="button" onClick={onBackToMe} className="h-11 w-full rounded-2xl text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
            {texts.backToMe}
          </button>
        )}
      </div>
    </motion.section>
  );
}
