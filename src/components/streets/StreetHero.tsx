import { motion } from "motion/react";
import type { StreetPeople } from "../../lib/streets/streetApi";
import type { StreetStats } from "../../lib/streets/streetGrouping";
import type { StreetScope } from "../../lib/streets/streetScope";
import { hasDemoSession } from "../../lib/auth/demoSession";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassCard from "../glass/GlassCard";
import GlassChip from "../glass/GlassChip";
import GlassNumber from "../glass/GlassNumber";
import type { StreetDetail } from "./StreetDetailSheet";

interface StreetHeroProps {
  scope: StreetScope;
  people: StreetPeople | null | undefined;
  stats: StreetStats;
  streets: number;
  period: string;
  loading: boolean;
  onDetail: (detail: StreetDetail) => void;
}

const texts = streetListTexts.hero;
const STAT = "group relative flex min-w-0 flex-col items-start rounded-2xl px-1 py-1 text-left transition-colors duration-300 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30";

/** Wessen Liste es ist: im Demo-Modus mit dem Namen der Beispiel-Führungskraft. */
function eyebrowOf(scope: StreetScope, people: StreetPeople | null | undefined): string {
  if (scope.view === "admin" || !hasDemoSession()) return streetListTexts.eyebrow[scope.view];
  const name = people?.users.find((u) => u.id === scope.meId)?.name ?? "";
  return fill(streetListTexts.demoEyebrow[scope.view], { name: name.split(" ")[0] ?? name });
}

/** Kopf der Straßenliste als tiefe Karte: Türen groß, darunter Verkäufe, aktive Personen und Quote; Antippen zeigt je Person. */
export default function StreetHero({ scope, people, stats, streets, period, loading, onDetail }: StreetHeroProps) {
  const quote = stats.doors > 0 ? Math.round((stats.sales / stats.doors) * 100) : 0;
  const tiles = [
    { id: "sales" as const, label: texts.sales, value: stats.sales },
    { id: "active" as const, label: texts.active, value: stats.active.length },
  ];
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6">
      <span aria-hidden className="pointer-events-none absolute -left-16 -top-24 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.3),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.28),transparent)]" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <span className="text-white/80">{eyebrowOf(scope, people)}</span> · {period}
        </p>
        {hasDemoSession() && (
          <GlassChip tone="amber" onDeep>
            {streetListTexts.demoBadge}
          </GlassChip>
        )}
      </div>
      <button type="button" onClick={() => onDetail("doors")} className={`${STAT} mt-3`}>
        <span className="flex items-baseline gap-2">
          <GlassNumber value={stats.doors} className="glass-text-shine text-[56px] font-semibold leading-none tracking-[-0.04em]" />
          <span className="text-[17px] font-medium text-white/60">{stats.doors === 1 ? texts.doorsOne : texts.doors}</span>
        </span>
      </button>
      <motion.p animate={{ opacity: loading ? 0.5 : 1 }} className="relative mt-1 text-[13px] text-white/55">
        {fill(streets === 1 && stats.places === 1 ? texts.lineOne : texts.line, { streets, places: stats.places })}
      </motion.p>
      <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
        {tiles.map((tile) => (
          <button key={tile.id} type="button" onClick={() => onDetail(tile.id)} className={STAT}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{tile.label}</span>
            <span className="mt-2 text-[22px] font-semibold leading-none tracking-[-0.02em] text-white">
              <GlassNumber value={tile.value} />
            </span>
          </button>
        ))}
        <div className="flex min-w-0 flex-col px-1 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{texts.quote}</span>
          <span className="mt-2 text-[22px] font-semibold leading-none tracking-[-0.02em] text-white">
            <GlassNumber value={quote} kind="percent" />
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
