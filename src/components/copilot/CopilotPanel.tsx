// Portal, Escape-Taste und Wischen zum Schließen brauchen den Browser
"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useEffect, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "../../hooks/useIsClient";
import { useSheetFeedback } from "../../hooks/useSheetFeedback";
import { useWideScreen } from "../../hooks/useWideScreen";
import { cn } from "../../lib/cn";
import { readCorner } from "../../lib/copilot/copilotDock";
import { SOFT_SPRING } from "../../lib/motion/presets";

interface CopilotPanelProps {
  open: boolean;
  onClose: () => void;
  labelId: string;
  children: ReactNode;
}

const CLOSE_OFFSET = 80;
const CLOSE_VELOCITY = 500;
const SURFACE = "glass-surface glass-blur flex flex-col overflow-hidden !bg-[rgba(246,247,251,0.97)] dark:!bg-[rgba(14,16,25,0.97)]";
/** iPad/Desktop: angedockt zwischen Topbar und unterer Leiste, die Seite daneben bleibt bedienbar. */
const DOCKED = "fixed z-[55] w-[400px] max-w-[calc(100vw-3rem)] rounded-[30px] top-[calc(6rem+env(safe-area-inset-top))] bottom-[calc(64px+1rem+env(safe-area-inset-bottom))]";
/** Handy: Sheet von unten, fast bildschirmhoch, damit Tastatur und Verlauf Platz haben. */
const SHEET = "relative h-[86dvh] w-full rounded-t-[30px] pb-[env(safe-area-inset-bottom,0px)]";

/**
 * Hülle des Chats: auf dem Handy ein wischbares Glas-Sheet mit Abdunklung, ab Tablet ein schwebendes
 * Panel an der Seite des Enes-Knopfs ohne Abdunklung (iPad quer: Chat und Seite nebeneinander).
 */
export default function CopilotPanel({ open, onClose, labelId, children }: CopilotPanelProps) {
  const mounted = useIsClient();
  const wide = useWideScreen();
  const controls = useDragControls();
  useSheetFeedback(open);
  const left = useMemo(() => open && mounted && readCorner().endsWith("left"), [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) onClose();
  };

  if (!mounted) return null;
  const hidden = wide ? { opacity: 0, x: left ? -24 : 24, scale: 0.97 } : { y: "100%" };
  return createPortal(
    <AnimatePresence>
      {open && wide && (
        <motion.div
          key="copilot-docked"
          role="dialog"
          aria-labelledby={labelId}
          className={cn(SURFACE, DOCKED, left ? "left-7" : "right-7", "shadow-[0_30px_80px_-24px_rgba(15,23,42,0.45)]")}
          initial={hidden}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={hidden}
          transition={SOFT_SPRING}
        >
          {children}
        </motion.div>
      )}
      {open && !wide && (
        <div key="copilot-sheet" className="fixed inset-0 z-[60] flex items-end">
          <motion.div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            className={cn(SURFACE, SHEET)}
            initial={hidden}
            animate={{ y: 0 }}
            exit={hidden}
            transition={SOFT_SPRING}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing" onPointerDown={(e) => controls.start(e)}>
              <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
