import { ChevronRight, Lock } from "lucide-react";
import { cn } from "../../lib/cn";
import { DAILY_STATUS_META } from "../../lib/overview/dailyStatus";
import { roleLabel, statusOf, type MemberStats } from "../../lib/overview/manageLogic";
import type { TeamUser } from "../../lib/overview/teamTypes";
import type { OrgTotals } from "../../lib/teams/orgTypes";
import { fill } from "../../texts/profileTexts";
import { teamsTexts } from "../../texts/teamsTexts";
import { GLASS_CHEVRON, GLASS_ROW, GLASS_ROW_INTERACTIVE, GLASS_SUBTITLE, GLASS_TITLE } from "../glass/glassStyles";
import OrgAvatar from "./OrgAvatar";

interface OrgPersonRowProps {
  user: TeamUser;
  stats: MemberStats;
  /** Summen des Astes, wenn Personen darunter hängen. */
  totals?: OrgTotals;
  /** Mentor aus einer anderen Gruppe, der nicht über der Person im Baum steht. */
  mentorName?: string;
  isMe: boolean;
  solar: boolean;
  now: Date;
  /** Eingerückt unter einer anderen Person: links weniger Luft. */
  nested: boolean;
  /** Ohne Aktion ist die Zeile nur zum Ansehen. */
  onOpen?: () => void;
}

const texts = teamsTexts.tree;

/** Eine Person im Baum: Avatar mit Status, Rolle und Hinweise; rechts heute (eigene Zahl oder Summe des Astes). */
export default function OrgPersonRow({ user, stats, totals, mentorName, isMe, solar, now, nested, onOpen }: OrgPersonRowProps) {
  const status = DAILY_STATUS_META[statusOf(user, now)];
  const flags = [user.isBlocked && texts.blocked, user.isActive === false && texts.inactive, user.battleInactive && texts.noBattle, status.isOut && status.label].filter(Boolean);
  const lead = user.role !== "berater";
  const big = totals ? totals.salesToday : stats.salesToday;
  const small = totals ? fill(texts.branch, { people: totals.people }) : fill(texts.month, { count: stats.salesMonth });
  const detail = totals ? fill(texts.self, { sales: stats.salesToday }) : fill(texts.doors, { doors: stats.doorsToday });
  const content = (
    <>
      <OrgAvatar name={user.name} role={user.role} dot={status.dot} />
      <span className="min-w-0 flex-1">
        <span className={cn(GLASS_TITLE, "flex items-center gap-1.5")}>
          <span className="truncate">{user.name}</span>
          {user.isBlocked && <Lock aria-hidden className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
          {isMe && <span className="shrink-0 rounded-full bg-red-500/12 px-1.5 py-px text-[10.5px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-500/20 dark:text-red-300">{texts.me}</span>}
        </span>
        <span className={cn(GLASS_SUBTITLE, "truncate")}>
          {lead && <span className="font-semibold text-indigo-600 dark:text-indigo-300">{roleLabel(user.role, solar)} · </span>}
          {detail}
          {mentorName && <span> · {fill(texts.mentorOf, { name: mentorName.split(" ")[0] ?? mentorName })}</span>}
          {flags.length > 0 && <span className="text-rose-600 dark:text-rose-400"> · {flags.join(" · ")}</span>}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className={cn("text-[17px] font-semibold tabular-nums leading-none", big > 0 ? "text-foreground" : "text-slate-300 dark:text-white/25")}>{big}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">{small}</span>
      </span>
    </>
  );
  const base = cn(GLASS_ROW, "min-w-0 flex-1", nested && "pl-2", (user.isActive === false || user.isBlocked) && "opacity-60");
  if (!onOpen) return <div className={base}>{content}</div>;
  return (
    <button type="button" onClick={onOpen} className={cn(base, GLASS_ROW_INTERACTIVE, "group")}>
      {content}
      {!totals && !nested && <ChevronRight aria-hidden className={GLASS_CHEVRON} />}
    </button>
  );
}
