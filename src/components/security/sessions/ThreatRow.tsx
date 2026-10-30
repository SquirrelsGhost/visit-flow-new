import { motion } from "motion/react";
import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { ageOf, threatLevel } from "../../../lib/security/securityLogic";
import type { ThreatEntity } from "../../../lib/security/securityThreatTypes";
import GlassChip from "../../glass/GlassChip";
import Mono from "../shared/Mono";
import RowButton from "../shared/RowButton";
import { THREAT_STYLE } from "../securityStyles";

interface ThreatRowProps {
  threat: ThreatEntity;
  /** E-Mail des Kontos, falls die IP angemeldet war. */
  email?: string;
  onClear: (threat: ThreatEntity) => void;
}

const MINUTE = 60_000;
/** v1 zeigte bei gesperrten IPs drei, bei verdächtigen zwei Ereignisse. */
const EVENTS = { blocked: 3, suspicious: 2 } as const;

/** Eine beobachtete IP: Wert als Balken 0–100, Stufe, Last und letzte Ereignisse; gesperrte lassen sich lösen. */
export default function ThreatRow({ threat: x, email, onClear }: ThreatRowProps) {
  const t = useSecurityTexts();
  const now = useNow(MINUTE).getTime();
  const level = threatLevel(x.score);
  const style = THREAT_STYLE[level];
  return (
    <div className="space-y-2.5 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className={`w-10 shrink-0 text-[22px] font-semibold leading-none tabular-nums tracking-[-0.03em] ${style.text}`}>{x.score}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-foreground">
              <Mono>{x.ip}</Mono>
            </span>
            {x.blocked ? <GlassChip tone="red">{t.threats.blocked}</GlassChip> : <GlassChip tone={level === "low" ? "green" : "amber"}>{t.threats.level[level]}</GlassChip>}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {[email ?? (x.userId && `${t.threats.user} ${x.userId}`), t.threats.perFive(x.requestsLast5Min), t.threats.endpoints(x.uniqueEndpoints), t.ago(ageOf(Date.parse(x.lastSeen), now))].filter(Boolean).join(" · ")}
          </p>
        </div>
        {x.blocked && <RowButton label={t.threats.unblock} ariaLabel={`${t.threats.unblock} ${x.ip}`} onClick={() => onClear(x)} />}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--glass-track)]">
        <motion.div className={`h-full rounded-full bg-gradient-to-r ${style.bar}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, x.score)}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
      </div>
      {x.blockReason && <p className="text-[12px] font-medium text-red-600 dark:text-red-400">{x.blockReason}</p>}
      {x.events.slice(-(x.blocked ? EVENTS.blocked : EVENTS.suspicious)).map((e) => (
        <p key={`${e.type}-${e.time}`} className="truncate rounded-xl bg-[var(--glass-track)]/70 px-2.5 py-1.5 text-[11.5px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">{e.type.replace(/_/g, " ")}</span> · {e.details}
        </p>
      ))}
    </div>
  );
}
