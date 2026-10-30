import { motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { SNAPPY_SPRING } from "../../../lib/motion/presets";
import { DAILY_STATUSES, DAILY_STATUS_META, type DailyStatusValue } from "../../../lib/overview/dailyStatus";
import { manageTexts } from "../../../texts/manageTexts";
import { GLASS_FIELD, GLASS_LABEL } from "../../glass/glassStyles";

interface MemberStatusFieldProps {
  status: DailyStatusValue;
  reason: string;
  until: string;
  today: string;
  onChange: (next: { status?: DailyStatusValue; reason?: string; until?: string }) => void;
}

const texts = manageTexts.member;

/** Tagesstatus als vier Glaskacheln; bei Krank oder Frei kommen Grund und letzter Tag dazu (v1 Status-Dialog). */
export default function MemberStatusField({ status, reason, until, today, onChange }: MemberStatusFieldProps) {
  const out = DAILY_STATUS_META[status].isOut || status === "wakeup_inactive";
  return (
    <section>
      <h3 className={GLASS_LABEL}>{texts.status}</h3>
      <div role="radiogroup" aria-label={texts.status} className="grid grid-cols-2 gap-2">
        {DAILY_STATUSES.map((value) => {
          const meta = DAILY_STATUS_META[value];
          const selected = value === status;
          return (
            <motion.button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ status: value })}
              className={cn("glass-surface relative flex flex-col items-start justify-start rounded-2xl px-3.5 py-3 text-left transition-shadow duration-300", selected && "shadow-[0_10px_24px_-14px_rgba(15,23,42,0.45)]")}
            >
              {selected && <motion.span layoutId="member-status-ring" transition={SNAPPY_SPRING} className="absolute inset-0 rounded-2xl ring-2 ring-red-500/70" />}
              <span className="flex items-center gap-2">
                <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                <span className="text-[14px] font-semibold text-foreground">{meta.label}</span>
              </span>
              <span className="mt-1 block text-[11.5px] leading-snug text-muted-foreground">{meta.hint}</span>
            </motion.button>
          );
        })}
      </div>
      {out && (
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <input aria-label={texts.reason} value={reason} onChange={(e) => onChange({ reason: e.target.value })} placeholder={texts.reasonPlaceholder} maxLength={80} className={GLASS_FIELD} />
          <label className="relative block">
            <span className="sr-only">{texts.until}</span>
            <input type="date" value={until} min={today} onChange={(e) => onChange({ until: e.target.value })} className={cn(GLASS_FIELD, "w-[9.5rem] px-3 dark:[color-scheme:dark]")} />
          </label>
        </div>
      )}
    </section>
  );
}
