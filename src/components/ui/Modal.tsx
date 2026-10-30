// Portal, Escape-Taste und Ein-/Ausblenden brauchen den Browser
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSheetFeedback } from "../../hooks/useSheetFeedback";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";

const subscribeNever = () => () => {};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Dialog über der ganzen App. Liegt im Portal an <body>, weil <main> von der Seiten-Animation
 * ein transform behält und ein fixed-Overlay sonst an der Scrollfläche kleben würde (wie in v1).
 * Kommt weich aus der Unschärfe, Hintergrund wird abgedunkelt und leicht verwischt.
 */
export default function Modal({ open, onClose, labelledBy, className, children }: ModalProps) {
  // Erst im Browser gibt es document.body für das Portal
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  useSheetFeedback(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={cn(
              "glass-surface glass-blur w-full max-w-sm overflow-hidden rounded-[28px]",
              className,
            )}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={SOFT_SPRING}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
