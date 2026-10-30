// Bündelt die Verwaltung; Cronjob-Einstellungen kommen aus einem Hook
"use client";

import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { useAutoAssignSettings } from "../../../hooks/useAutoAssignSettings";
import type { BattleArenaState } from "../../../hooks/useBattleArena";
import type { Vertical } from "../../../lib/battle/battleCategories";
import { staggerParent, riseIn } from "../../../lib/motion/presets";
import { battleAdminTexts as t } from "../../../texts/battleAdminTexts";
import ArenaSection from "../ArenaSection";
import { PANEL_CARD } from "../battleStyles";
import PanelHeader from "../PanelHeader";
import AdminGroup from "./AdminGroup";
import AutoAssignNow from "./AutoAssignNow";
import AutoModeSelect from "./AutoModeSelect";
import CronToggle from "./CronToggle";
import ManualAssign from "./ManualAssign";
import PointConfigEditor from "./PointConfigEditor";
import StreakResetRow from "./StreakResetRow";

interface BattleAdminPanelProps {
  arena: BattleArenaState;
  vertical: Vertical;
  onResetStreaks: () => void;
}

/** "Battle Verwaltung" für Admin und Teamleiter: zuweisen, Automatik, Bonuspunkte, Serien zurücksetzen. */
export default function BattleAdminPanel({ arena, vertical, onResetStreaks }: BattleAdminPanelProps) {
  const auto = useAutoAssignSettings(true);
  const { actions } = arena;
  return (
    <ArenaSection>
      <div className={PANEL_CARD}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_100%_at_15%_0%,rgba(239,68,68,0.08),transparent)]" />
        <motion.div variants={staggerParent(0.06, 0.05)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="relative space-y-7 p-5 sm:p-6">
          <motion.div variants={riseIn}>
            <PanelHeader icon={Shield} title={t.title} subtitle={t.subtitle} />
          </motion.div>
          <motion.div variants={riseIn}>
            <AdminGroup label={t.groupAssign}>
              <ManualAssign users={arena.users} battles={arena.active} readiness={arena.readiness} busy={actions.isBusy("assign")} onAssign={actions.manualAssign} />
            </AdminGroup>
          </motion.div>
          <motion.div variants={riseIn}>
            <AdminGroup label={t.groupAuto}>
              <CronToggle on={auto.cronOn} busy={auto.toggling} onToggle={auto.toggleCron} />
              <AutoModeSelect mode={auto.mode} onChange={auto.changeMode} />
              <AutoAssignNow busy={actions.isBusy("auto")} onTrigger={actions.autoAssign} />
            </AdminGroup>
          </motion.div>
          {vertical !== "solar" && (
            <motion.div variants={riseIn}>
              <AdminGroup label={t.groupPoints} hint={t.pointsHint}>
                <PointConfigEditor points={arena.points} />
              </AdminGroup>
            </motion.div>
          )}
          <motion.div variants={riseIn}>
            <AdminGroup label={t.groupDanger}>
              <StreakResetRow onReset={onResetStreaks} />
            </AdminGroup>
          </motion.div>
        </motion.div>
      </div>
    </ArenaSection>
  );
}
