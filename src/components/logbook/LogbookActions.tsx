import { Car, FileDown, Lock, LockOpen, Plus } from "lucide-react";
import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";
import type { LogbookTexts } from "../../texts/logbook/logbookTexts";
import GlassQuickAction from "../glass/GlassQuickAction";

interface LogbookActionsProps {
  t: LogbookTexts;
  locked: boolean;
  onNew: () => void;
  onExport: () => void;
  onVehicle: () => void;
  onLock: () => void;
}

/** Schnellknöpfe unter der Kopfkarte wie in Banking-Apps: neue Fahrt, Export, Fahrzeug, Monat abschließen. */
export default function LogbookActions({ t, locked, onNew, onExport, onVehicle, onLock }: LogbookActionsProps) {
  return (
    <motion.div variants={riseIn} role="group" aria-label={t.actions} className="flex gap-2 px-1">
      <GlassQuickAction icon={Plus} label={t.newTrip} onClick={onNew} />
      <GlassQuickAction icon={FileDown} label={t.export} onClick={onExport} />
      <GlassQuickAction icon={Car} label={t.vehicle} onClick={onVehicle} />
      <GlassQuickAction icon={locked ? LockOpen : Lock} label={locked ? t.unlock : t.lock} onClick={onLock} />
    </motion.div>
  );
}
