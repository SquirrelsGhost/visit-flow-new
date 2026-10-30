import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/cn";
import { pencilSellTexts as t } from "../../../texts/pencilSellTexts";
import { CALC_SMALL_BTN } from "../calcGlass";

interface RemoveButtonProps {
  show: boolean;
  onClick: () => void;
}

/** Kleiner "entfernen"-Knopf neben einer Auswahl, gleitet weich herein. */
export default function RemoveButton({ show, onClick }: RemoveButtonProps) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ opacity: 0, scale: 0.9, width: 0 }}
          animate={{ opacity: 1, scale: 1, width: "auto" }}
          exit={{ opacity: 0, scale: 0.9, width: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(CALC_SMALL_BTN, "h-12 overflow-hidden whitespace-nowrap rounded-2xl")}
        >
          {t.remove}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
