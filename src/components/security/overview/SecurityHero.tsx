import { useNow } from "../../../hooks/useNow";
import { useSecurityTexts } from "../../../hooks/useSecurityTexts";
import { hasDemoSession } from "../../../lib/auth/demoSession";
import { ageOf, healthLevel, healthScore, lastIncident, openAlerts } from "../../../lib/security/securityLogic";
import type { SecuritySnapshot } from "../../../lib/security/securityTypes";
import GlassCard from "../../glass/GlassCard";
import GlassChip from "../../glass/GlassChip";
import GlassNumber from "../../glass/GlassNumber";
import GlassRing from "../../glass/GlassRing";
import GlassStat from "../../glass/GlassStat";
import { HEALTH_STYLE } from "../securityStyles";
import LiveStatus from "./LiveStatus";

interface SecurityHeroProps {
  snapshot: SecuritySnapshot;
  refreshing: boolean;
  onRefresh: () => void;
}

const MINUTE = 60_000;

/**
 * Kopf der Lage als tiefe Karte (v1 SecurityOverview): Sicherheitswert als Ring, Einordnung in Worten,
 * daneben aktive und gesperrte IPs, Login-Sperren und offene Alarme; unten der letzte Vorfall.
 */
export default function SecurityHero({ snapshot, refreshing, onRefresh }: SecurityHeroProps) {
  const t = useSecurityTexts();
  const now = useNow(MINUTE).getTime();
  const score = healthScore(snapshot);
  const level = healthLevel(score);
  const style = HEALTH_STYLE[level];
  const incident = lastIncident(snapshot);
  const tiles = [
    { label: t.hero.activeIps, value: snapshot.firewall?.activeIPs },
    { label: t.hero.blocked, value: snapshot.firewall?.blockedIPs },
    { label: t.hero.locks, value: snapshot.login?.activeLocks },
    { label: t.hero.alerts, value: snapshot.alerts ? openAlerts(snapshot.alerts).length : undefined },
  ];
  return (
    <GlassCard variant="deep" sheen spotlight className="px-5 pb-5 pt-6 lg:px-7 lg:pt-7">
      <span aria-hidden className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full transition-[background] duration-700" style={{ background: `radial-gradient(closest-side, ${style.glow}, transparent)` }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-28 right-[-3rem] h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.28),transparent)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <p className="pt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{t.hero.eyebrow}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          {hasDemoSession() && (
            <GlassChip tone="amber" onDeep>
              {t.demoBadge}
            </GlassChip>
          )}
          <LiveStatus loadedAt={snapshot.loadedAt} refreshing={refreshing} onRefresh={onRefresh} />
        </div>
      </div>
      <div className="relative mt-5 lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 items-center gap-5">
          <GlassRing share={score / 100} tone={style.ring} size={112} label={t.hero.score}>
            <GlassNumber value={score} className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-white" />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">/ 100</span>
          </GlassRing>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">{t.hero.score}</p>
            <p className={`mt-1 text-[30px] font-semibold leading-none tracking-[-0.03em] ${style.text}`}>{t.hero.level[level]}</p>
            <p className="mt-2 max-w-[22rem] text-[13px] leading-snug text-white/60">{t.hero.levelText[level]}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-white/10 pt-5 min-[460px]:grid-cols-4 lg:mt-0 lg:w-[30rem] lg:shrink-0 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          {tiles.map((tile) => (
            <GlassStat key={tile.label} label={tile.label} onDeep>
              {tile.value === undefined ? "–" : <GlassNumber value={tile.value} />}
            </GlassStat>
          ))}
        </div>
      </div>
      <p className="relative mt-5 truncate text-[12px] text-white/50">{incident === null ? t.hero.noIncident : t.hero.incident(t.ago(ageOf(incident, now)))}</p>
    </GlassCard>
  );
}
