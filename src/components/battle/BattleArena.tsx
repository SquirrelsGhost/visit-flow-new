// Seite mit Live-Daten, Dialogen und Animationen: braucht den Browser
"use client";

import { useState } from "react";
import { useBattleArena } from "../../hooks/useBattleArena";
import { useHeroPhase } from "../../hooks/useHeroPhase";
import { useIncomingChallenge } from "../../hooks/useIncomingChallenge";
import { useMomentOnce } from "../../hooks/useMomentOnce";
import { useVertical } from "../../hooks/useVertical";
import { buildRecap } from "../../lib/battle/battleRecap";
import type { TeamMember } from "../../lib/battle/battleTypes";
import { featuredDuel } from "../../lib/battle/duel";
import { battleWinMarker } from "../../lib/feedback/feedbackMoments";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassSplit from "../glass/GlassSplit";
import ActiveBattles from "./ActiveBattles";
import BattleAdminPanel from "./admin/BattleAdminPanel";
import BattleArenaSkeleton from "./BattleArenaSkeleton";
import BattleDialogs, { type BattleDialog } from "./BattleDialogs";
import BattleHero from "./hero/BattleHero";
import HeroBack from "./hero/HeroBack";
import HeroFront from "./hero/HeroFront";
import IncomingChallengeDialog from "./IncomingChallengeDialog";
import InactiveList from "./InactiveList";
import BattleLogs from "./logs/BattleLogs";
import OutgoingChallenges from "./OutgoingChallenges";
import PendingChallenges from "./PendingChallenges";
import SalesManageDialog from "./SalesManageDialog";
import SickList from "./SickList";
import TeamChallengeList from "./TeamChallengeList";
import TopToday from "./TopToday";

/** Battle Arena (v1 BattleArena) im Glas-Design: Kopfkarte, Herausforderungen, Live-Duelle, Rangliste, Team und Verwaltung. */
export interface BattleArenaProps { readonly _?: never; }

export default function BattleArena() {
  const vertical = useVertical();
  const arena = useBattleArena(vertical);
  const hero = useHeroPhase();
  const [dialog, setDialog] = useState<BattleDialog>(null);
  const [salesOf, setSalesOf] = useState<TeamMember | null>(null);
  const { incoming, dismissIncoming } = useIncomingChallenge(arena.user, arena.pending, arena.reload);
  const { actions, snapshot } = arena;
  const recap = snapshot ? buildRecap(snapshot.completedBattles, arena.readiness.inactive) : null;
  // Gewonnen? Einmal Fanfare und Konfetti je Sieg
  useMomentOnce("vf-moment-battle-win", recap ? battleWinMarker(recap.battles, arena.meId) : null, "win");
  const respond = async (id: string, action: "accept" | "decline") => {
    await actions.respond(id, action);
    dismissIncoming();
  };

  return (
    <GlassPage>
      <div className="arena-bg h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {!snapshot ? (
          <BattleArenaSkeleton />
        ) : (
          <GlassBody layout="wide">
            <BattleHero
              phase={hero.phase}
              onPhase={hero.setPhase}
              onRefresh={arena.refresh}
              arena={
                <HeroFront
                  duel={featuredDuel(arena.active, arena.meId, arena.scoreOf)}
                  scoreOf={arena.scoreOf}
                  sales={arena.statsOf(arena.meId).sales}
                  battles={arena.active.length}
                  streak={arena.streaks[arena.meId]}
                />
              }
              recap={<HeroBack recap={recap ?? buildRecap(snapshot.completedBattles, arena.readiness.inactive)} topEarners={snapshot.topEarners} sick={arena.readiness.sickToday} />}
            />
            <GlassSplit
              ratio="even"
              aside={
                <>
                  <PendingChallenges challenges={arena.pending} isBusy={(id) => actions.isBusy(`respond:${id}`)} onRespond={respond} />
                  <ActiveBattles
                    battles={arena.active}
                    streaks={arena.streaks}
                    meId={arena.meId}
                    canManage={arena.canManage}
                    scoreOf={arena.scoreOf}
                    isBusy={actions.isBusy}
                    onSick={(id) => setDialog({ kind: "sick", id })}
                    onCancel={(id) => setDialog({ kind: "cancel", id })}
                  />
                  <TopToday dayStats={arena.dayStats} users={arena.users} meId={arena.meId} />
                  <OutgoingChallenges challenges={arena.outgoing} />
                </>
              }
            >
              <TeamChallengeList
                members={arena.members}
                battles={arena.active}
                streaks={arena.streaks}
                canManage={arena.canManage}
                isBusy={actions.isBusy}
                onChallenge={actions.challenge}
                onManageSales={setSalesOf}
              />
              <SickList sick={arena.readiness.sickToday} canManage={arena.canManage} isBusy={actions.isBusy} onLift={(b) => setDialog({ kind: "liftSick", id: b.userId, name: b.name })} />
              <InactiveList inactive={arena.readiness.inactive} vertical={vertical} canManage={arena.canManage} isBusy={actions.isBusy} onLift={(b) => setDialog({ kind: "liftInactive", id: b.userId, name: b.name })} />
            </GlassSplit>
            {arena.canManage && (
              <GlassSplit ratio="even" aside={<BattleAdminPanel arena={arena} vertical={vertical} onResetStreaks={() => setDialog({ kind: "reset" })} />}>
                <BattleLogs />
              </GlassSplit>
            )}
          </GlassBody>
        )}
      </div>
      <IncomingChallengeDialog challenge={incoming} busy={!!incoming && actions.isBusy(`respond:${incoming.id}`)} onRespond={respond} onClose={dismissIncoming} />
      <BattleDialogs dialog={dialog} battles={arena.active} actions={actions} onClose={() => setDialog(null)} />
      <SalesManageDialog member={salesOf} products={arena.products} today={arena.today} isBusy={actions.isBusy} onToggle={actions.toggleExclude} onClose={() => setSalesOf(null)} />
    </GlassPage>
  );
}
