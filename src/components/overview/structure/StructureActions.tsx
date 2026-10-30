import { CalendarCheck, ClipboardList, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { riseIn } from "../../../lib/motion/presets";
import { structureTexts } from "../../../texts/structureTexts";
import GlassQuickAction from "../../glass/GlassQuickAction";

interface StructureActionsProps {
  onReport: () => void;
  onContest: () => void;
}

/** Schnellknöpfe der Struktur: Auswertung teilen, Gewinnspiel für die Gruppe, Tagesstatus. */
export default function StructureActions({ onReport, onContest }: StructureActionsProps) {
  const router = useRouter();
  return (
    <motion.div variants={riseIn} className="flex gap-2 px-1">
      <GlassQuickAction icon={ClipboardList} label={structureTexts.actions.report} onClick={onReport} />
      <GlassQuickAction icon={Trophy} label={structureTexts.actions.contest} onClick={onContest} />
      <GlassQuickAction icon={CalendarCheck} label={structureTexts.actions.status} onClick={() => router.push("/daily-status")} />
    </motion.div>
  );
}
