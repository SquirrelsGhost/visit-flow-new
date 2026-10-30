import { CalendarOff, Search, Target, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../../lib/motion/presets";
import { manageTexts } from "../../../texts/manageTexts";
import GlassQuickAction from "../../glass/GlassQuickAction";

interface ManageActionsProps {
  onGoals: () => void;
  onContest: () => void;
  onAbsent: () => void;
  onSearch: () => void;
}

const texts = manageTexts.actions;

/** Schnellknöpfe unter der Kopfkarte wie in Banking-Apps. */
export default function ManageActions({ onGoals, onContest, onAbsent, onSearch }: ManageActionsProps) {
  return (
    <motion.div variants={riseIn} className="flex gap-2 px-1">
      <GlassQuickAction icon={Target} label={texts.goals} onClick={onGoals} />
      <GlassQuickAction icon={Trophy} label={texts.contest} onClick={onContest} />
      <GlassQuickAction icon={CalendarOff} label={texts.status} onClick={onAbsent} />
      <GlassQuickAction icon={Search} label={texts.search} onClick={onSearch} />
    </motion.div>
  );
}
