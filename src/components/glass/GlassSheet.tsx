// Portal, Escape-Taste und Wischen zum Schließen brauchen den Browser
"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useEffect, useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSheetFeedback } from "../../hooks/useSheetFeedback";
import { useWideScreen } from "../../hooks/useWideScreen";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";

interface GlassSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  /** Breiteres Panel ab iPad quer (lg), z. B. für Formulare mit zwei Spalten. */
  wide?: boolean;
  children: ReactNode;
}

const subscribeNever = () => () => {};
/** Ab so viel Zug nach unten (px) oder so schnellem Wischen (px/s) schließt das Sheet, wie die Karte. */
const CLOSE_OFFSET = 80;
const CLOSE_VELOCITY = 500;

/**
 * Gläsernes Bottom-Sheet für Aktionen: gleitet mit weicher Feder von unten herein, lässt sich am Griff
 * wegwischen und liegt im Portal an <body> (wie Modal), damit es über Topbar und Navigation steht.
 * Ab Tablet-Breite schwebt es als Panel in der Mitte (iPad quer), dort ohne Griff und Wischen.
 */
export default function GlassSheet({ open, onClose, title, subtitle, wide: widePanel = false, children }: GlassSheetProps) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const controls = useDragControls();
  const titleId = useId();
  const wide = useWideScreen();
  const hidden = wide ? { opacity: 0, y: 28, scale: 0.97 } : { y: "100%" };
  useSheetFeedback(open);

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
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[60] flex justify-center", wide ? "items-center p-6" : "items-end")}>
          <motion.div
            key="glass-sheet-backdrop"
            className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            key="glass-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "glass-surface glass-blur relative flex w-full max-w-xl flex-col !bg-[rgba(246,247,251,0.97)] dark:!bg-[rgba(14,16,25,0.97)]",
              wide ? "max-h-[min(86dvh,760px)] rounded-[30px] pt-3" : "max-h-[88dvh] rounded-t-[30px] pb-[env(safe-area-inset-bottom,0px)]",
              widePanel && "lg:max-w-4xl",
            )}
            initial={hidden}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={hidden}
            transition={SOFT_SPRING}
            drag={wide ? false : "y"}
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            {!wide && (
              <div className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing" onPointerDown={(e) => controls.start(e)}>
                <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
              </div>
            )}
            <div className="shrink-0 px-5 pb-3">
              <h2 id={titleId} className="text-[19px] font-semibold tracking-[-0.02em] text-foreground">
                {title}
              </h2>
              {subtitle && <div className="mt-1 text-[13px] leading-snug text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-7">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
