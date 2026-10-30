// Wischen braucht Zeiger-Ereignisse im Browser
"use client";

import { Check, X } from "lucide-react";
import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import type { ReactNode } from "react";
import { crmTexts as t } from "../../texts/crmTexts";

interface OrderSwipeProps {
  /** Wischen nur bei offenen, bearbeitbaren Aufträgen (v1: nicht bei Leads und abgeschlossenen). */
  enabled: boolean;
  onCancel: () => void;
  onComplete: () => void;
  /** Meldet Beginn und Ende, damit ein Wisch nicht zugleich als Tippen zählt. */
  onDragging: (dragging: boolean) => void;
  children: ReactNode;
}

/** Ab so viel Weg (px) oder so schnellem Wischen (px/s) löst die Aktion aus, wie SWIPE_THRESHOLD in v1. */
const TRIGGER = 72;
const VELOCITY = 600;

/**
 * Wisch-Gesten der v1-Aufträge: nach rechts storniert (zählt zur Quote), nach links schließt ab.
 * Unter der Karte liegen rote und grüne Flächen, die mit dem Weg aufleuchten; die Karte federt zurück.
 */
export default function OrderSwipe({ enabled, onCancel, onComplete, onDragging, children }: OrderSwipeProps) {
  const x = useMotionValue(0);
  const cancelOpacity = useTransform(x, [0, TRIGGER], [0, 1]);
  const completeOpacity = useTransform(x, [-TRIGGER, 0], [1, 0]);
  const cancelScale = useTransform(x, [TRIGGER * 0.6, TRIGGER], [0.7, 1]);
  const completeScale = useTransform(x, [-TRIGGER, -TRIGGER * 0.6], [1, 0.7]);

  const handleEnd = (_: unknown, info: PanInfo) => {
    // Erst nach dem Klick-Ereignis freigeben, das der Browser nach dem Loslassen noch schickt
    window.setTimeout(() => onDragging(false), 0);
    if (info.offset.x > TRIGGER || info.velocity.x > VELOCITY) onCancel();
    else if (info.offset.x < -TRIGGER || info.velocity.x < -VELOCITY) onComplete();
  };

  if (!enabled) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[26px]">
        <motion.div style={{ opacity: cancelOpacity }} className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-red-500 to-rose-500/70 pl-6">
          <motion.span style={{ scale: cancelScale }} className="glass-keep-white flex items-center gap-2 text-[13px] font-semibold text-white">
            <X className="h-5 w-5" strokeWidth={2.6} />
            {t.cancel}
          </motion.span>
        </motion.div>
        <motion.div style={{ opacity: completeOpacity }} className="absolute inset-0 flex items-center justify-end bg-gradient-to-l from-emerald-500 to-emerald-400/70 pr-6">
          <motion.span style={{ scale: completeScale }} className="glass-keep-white flex items-center gap-2 text-[13px] font-semibold text-white">
            {t.complete}
            <Check className="h-5 w-5" strokeWidth={2.6} />
          </motion.span>
        </motion.div>
      </div>
      <motion.div
        style={{ x, touchAction: "pan-y" }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.55}
        dragSnapToOrigin
        onDragStart={() => onDragging(true)}
        onDragEnd={handleEnd}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
