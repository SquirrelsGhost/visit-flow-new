import { ChevronRight } from "lucide-react";
import { cn } from "../../../lib/cn";
import { DAILY_STATUS_META } from "../../../lib/overview/dailyStatus";
import { roleLabel, statusOf, type MemberStats } from "../../../lib/overview/manageLogic";
import { DEFAULT_AVATAR, ROLE_AVATAR } from "../../../lib/overview/roleStyles";
import type { TeamUser } from "../../../lib/overview/teamTypes";
import { fill } from "../../../texts/profileTexts";
import { manageTexts } from "../../../texts/manageTexts";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../../glass/glassStyles";

interface MemberRowProps {
  member: TeamUser;
  stats: MemberStats;
  solar: boolean;
  now: Date;
  onOpen: (member: TeamUser) => void;
}

const texts = manageTexts.list;

/** Eine Person der Teamliste: Status-Punkt am Avatar, Zahlen von heute, Rolle; Tippen öffnet die Bearbeitung. */
export default function MemberRow({ member, stats, solar, now, onOpen }: MemberRowProps) {
  const status = DAILY_STATUS_META[statusOf(member, now)];
  const flags = [member.isActive === false && texts.inactive, member.battleInactive && texts.noBattle, status.isOut && status.label].filter(Boolean);
  const lead = member.role !== "berater";
  return (
    <button type="button" onClick={() => onOpen(member)} className={cn(GLASS_ROW, GLASS_ROW_INTERACTIVE, "group", member.isActive === false && "opacity-60")}>
      <span className="relative shrink-0">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px] ring-1 ring-inset ring-white/25", ROLE_AVATAR[member.role] ?? DEFAULT_AVATAR)}>
          {member.name.charAt(0).toUpperCase()}
        </span>
        <span aria-hidden className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-[2.5px] ring-[var(--aurora-base)]", status.dot)} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "truncate")}>{member.name}</span>
        <span className={cn(GLASS_SUBTITLE, "truncate")}>
          {lead && <span className="font-semibold text-indigo-600 dark:text-indigo-300">{roleLabel(member.role, solar)} · </span>}
          {fill(texts.today, { sales: stats.salesToday, doors: stats.doorsToday })}
          {flags.length > 0 && <span className="text-rose-600 dark:text-rose-400"> · {flags.join(" · ")}</span>}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className={cn("text-[17px] font-semibold tabular-nums leading-none", stats.salesToday > 0 ? "text-foreground" : "text-slate-300 dark:text-white/25")}>{stats.salesToday}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">{fill(texts.month, { count: stats.salesMonth })}</span>
      </span>
      <ChevronRight aria-hidden className={GLASS_CHEVRON} />
    </button>
  );
}
