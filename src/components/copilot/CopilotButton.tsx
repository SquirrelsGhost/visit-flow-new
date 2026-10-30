// Ziehen und Federn brauchen Zeiger-Ereignisse im Browser
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCopilotDock } from "../../hooks/useCopilotDock";
import { useWideScreen } from "../../hooks/useWideScreen";
import { ORB_SIZE } from "../../lib/copilot/copilotDock";
import { copilotTexts } from "../../texts/copilotTexts";
import CopilotOrb from "./CopilotOrb";

interface CopilotButtonProps {
  hidden: boolean;
  onOpen: () => void;
}

const BUTTON =
  "fixed left-0 top-0 z-[45] touch-none rounded-full shadow-[0_14px_34px_-12px_rgba(220,38,38,0.65),0_4px_14px_-6px_rgba(15,23,42,0.35)] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30";

/**
 * Schwebender Zugang zu Enes auf jeder Seite (v1 Siri-artiger Knopf): tippen öffnet den Chat,
 * ziehen verschiebt ihn, beim Loslassen rastet er in der nächsten Ecke ein. Ein leiser Schein pulsiert dahinter.
 */
export default function CopilotButton({ hidden, onOpen }: CopilotButtonProps) {
  const { x, y, ready, onDragEnd } = useCopilotDock();
  const wide = useWideScreen();
  const size = wide ? ORB_SIZE.wide : ORB_SIZE.phone;
  return (
    <AnimatePresence>
      {ready && !hidden && (
        <motion.button
          type="button"
          aria-label={copilotTexts.open}
          title={copilotTexts.dragHint}
          className={BUTTON}
          style={{ x, y, width: size, height: size }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          drag
          dragMomentum={false}
          dragElastic={0.2}
          whileDrag={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onDragEnd={onDragEnd}
          onTap={onOpen}
        >
          <span aria-hidden className="absolute -inset-2 rounded-full bg-red-500/25 blur-xl motion-safe:animate-pulse" />
          <CopilotOrb size={size} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
