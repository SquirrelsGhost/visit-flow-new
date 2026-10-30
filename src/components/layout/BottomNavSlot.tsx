import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { NavTarget } from "../../lib/navigation/navTargets";
import BottomNavItem from "./BottomNavItem";

interface BottomNavSlotProps {
  target: NavTarget;
  active: boolean;
  onLongPress: () => void;
}

/** Ein Platz der Leiste. Wechselt die Belegung, taucht die neue Seite weich aus der Unschärfe auf. */
export default function BottomNavSlot({ target, active, onLongPress }: BottomNavSlotProps) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.85, filter: "blur(4px)" };
  return (
    <li className="relative h-full flex-1 text-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={target.id}
          className="h-full"
          initial={hidden}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          exit={hidden}
          transition={reduce ? { duration: 0.15 } : SOFT_SPRING}
        >
          <BottomNavItem item={target} active={active} onLongPress={onLongPress} />
        </motion.div>
      </AnimatePresence>
    </li>
  );
}
