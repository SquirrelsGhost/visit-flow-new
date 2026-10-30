import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { TeamRank } from "../../lib/admin/adminTypes";
import { cn } from "../../lib/cn";
import { adminTexts } from "../../texts/adminTexts";
import { fill } from "../../texts/profileTexts";
import GlassNumber from "../glass/GlassNumber";
import GlassProgress from "../glass/GlassProgress";
import { GLASS_CHEVRON, GLASS_ROW_INTERACTIVE } from "../glass/glassStyles";
import AdminPanel from "./AdminPanel";

interface AdminRankingCardProps {
  teams: readonly TeamRank[];
}

const texts = adminTexts.ranking;
const SHOWN = 5;
const PLACE = ["from-amber-300 to-amber-500 text-amber-950", "from-slate-200 to-slate-400 text-slate-800", "from-orange-300 to-orange-500 text-orange-950"];

/** Die stärksten Teams des Monats mit Balken im Verhältnis zum besten; ein Tipp führt zu Meine Teams. */
export default function AdminRankingCard({ teams }: AdminRankingCardProps) {
  const top = teams.slice(0, SHOWN);
  const best = Math.max(1, top[0]?.salesMonth ?? 0);
  return (
    <AdminPanel label={texts.label} className="p-1.5">
      {top.length === 0 && <p className="px-3 py-4 text-[13px] text-muted-foreground">{texts.empty}</p>}
      {top.map((team, i) => (
        <Link key={team.id} href="/teams" className={cn("group flex items-center gap-3 rounded-[20px] px-2.5 py-2.5", GLASS_ROW_INTERACTIVE)}>
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold shadow-sm", PLACE[i] ?? "from-slate-100 to-slate-200 text-slate-600 dark:from-white/10 dark:to-white/5 dark:text-white/70")}>{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">{team.name}</span>
              <span className="shrink-0 text-[15px] font-semibold text-foreground">
                <GlassNumber value={team.salesMonth} />
              </span>
            </span>
            <GlassProgress share={team.salesMonth / best} label={team.name} tone={i === 0 ? "red" : "indigo"} now={team.salesMonth} max={best} className="mt-1.5" />
            <span className="mt-1.5 block text-[12px] text-muted-foreground">
              {fill(texts.people, { count: team.people })} · {fill(texts.today, { count: team.salesToday })}
            </span>
          </span>
          <ChevronRight aria-hidden className={GLASS_CHEVRON} />
        </Link>
      ))}
    </AdminPanel>
  );
}
