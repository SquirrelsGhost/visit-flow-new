import { motion } from "motion/react";
import { riseIn } from "../../lib/motion/presets";

interface UserMenuDividerProps {
  /** Optionale Überschrift der folgenden Gruppe, z. B. "Administration". */
  caption?: string;
}

/** Trennlinie zwischen Gruppen im Benutzermenü, auf Wunsch mit kleiner Überschrift darunter. */
export default function UserMenuDivider({ caption }: UserMenuDividerProps) {
  return (
    <motion.li variants={riseIn} role="none" className="px-1 pt-1">
      <span role="separator" className="my-1 block h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      {caption && (
        <span className="block px-2 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          {caption}
        </span>
      )}
    </motion.li>
  );
}
