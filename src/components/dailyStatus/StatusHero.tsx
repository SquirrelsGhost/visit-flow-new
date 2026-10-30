import { effectiveStatus, isOutOfBattles, statusWindow, upcomingStatus } from "../../lib/team/dailyStatus";
import { formatShortDay } from "../../lib/team/statusDraft";
import type { TeamMember } from "../../lib/team/teamTypes";
import { dailyStatusTexts as texts } from "../../texts/dailyStatusTexts";
import { fill } from "../../texts/profileTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import StatusDot from "./StatusDot";

interface StatusHeroProps {
  member: TeamMember;
  isSelf: boolean;
  demo: boolean;
}

const GLOW = {
  active: "rgba(16,185,129,0.4)",
  wakeup_inactive: "rgba(59,130,246,0.42)",
  sick: "rgba(244,63,94,0.42)",
  inactive: "rgba(245,158,11,0.4)",
} as const;

function windowLine(member: TeamMember): string {
  const window = statusWindow(member);
  if (!window) return texts.windowNone;
  const start = formatShortDay(window.start);
  return window.start === window.end ? fill(texts.windowOne, { start }) : fill(texts.windowRange, { start, end: formatShortDay(window.end) });
}

/**
 * Kopf des Tagesstatus als tiefe Karte: der heute gültige Status groß mit leuchtendem Punkt, darunter der
 * Zeitraum und was er für die Battles bedeutet. Die Farbe des Lichts folgt dem Status.
 */
export default function StatusHero({ member, isSelf, demo }: StatusHeroProps) {
  const status = effectiveStatus(member);
  const upcoming = upcomingStatus(member);
  const out = isOutOfBattles(member);
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full transition-[background] duration-700"
        style={{ background: `radial-gradient(closest-side, ${GLOW[status]}, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
          {isSelf ? texts.eyebrowMe : fill(texts.eyebrowOther, { name: member.name })}
        </p>
        {demo && (
          <GlassChip tone="amber" onDeep>
            {texts.demoBadge}
          </GlassChip>
        )}
      </div>
      <div className="relative mt-4 flex items-center gap-3.5">
        <StatusDot status={status} size="lg" />
        <h2 className="glass-text-shine truncate text-[34px] font-semibold leading-none tracking-[-0.035em]">{texts.status[status]}</h2>
      </div>
      <p className="relative mt-2.5 text-[13px] text-white/60">
        {status === "active" ? texts.statusHint.active : windowLine(member)}
        {member.dailyStatusReason && status !== "active" ? ` · „${member.dailyStatusReason}“` : ""}
      </p>
      <div className="relative mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
        <GlassChip tone={out ? "red" : "green"} onDeep>
          {out ? texts.outOfBattles : texts.inBattles}
        </GlassChip>
        {upcoming && (
          <GlassChip tone="amber" onDeep>
            {fill(texts.upcoming, { status: texts.short[upcoming.status], start: formatShortDay(upcoming.start) })}
          </GlassChip>
        )}
      </div>
    </GlassCard>
  );
}
