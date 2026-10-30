// Ziehen zum Schließen und Ein-/Ausgleiten brauchen Zeiger-Events und motion im Browser
"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import type { ReactNode } from "react";
import { SOFT_SPRING } from "../../lib/motion/presets";

interface MapSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Ab so viel Zug nach unten (px) oder so schnellem Wischen (px/s) schließt das Sheet (v1: 80 px). */
const CLOSE_OFFSET = 80;
const CLOSE_VELOCITY = 500;

/**
 * Bottom-Sheet der Karte: gleitet mit weicher Feder herein und lässt sich am Griff nach unten
 * wegwischen wie in v1. Bei "Bewegung reduzieren" blendet MotionProvider nur über.
 */
export default function MapSheet({ open, onClose, children }: MapSheetProps) {
  const controls = useDragControls();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="map-sheet-backdrop"
            className="absolute inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            key="map-sheet-panel"
            role="dialog"
            aria-modal="true"
            className="glass-surface glass-blur absolute bottom-0 left-0 right-0 z-[60] flex max-h-[82%] flex-col rounded-t-[28px] border-t px-4 pb-4 md:bottom-3 md:mx-auto md:max-w-xl md:rounded-[28px] md:border"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SOFT_SPRING}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex w-full flex-shrink-0 cursor-grab touch-none justify-center pb-3 pt-3 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
