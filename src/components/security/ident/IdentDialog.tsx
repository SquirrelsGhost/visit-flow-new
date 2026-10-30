// Portal, Escape-Taste und Ein-/Ausblenden brauchen den Browser
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSheetFeedback } from "@/hooks/useSheetFeedback";
import { useWideScreen } from "@/hooks/useWideScreen";
import { cn } from "@/lib/cn";
import { SOFT_SPRING } from "@/lib/motion/presets";

interface IdentDialogProps {
  open: boolean;
  onClose: () => void;
  label: string;
  /** Linke Spalte ab iPad quer (Schrittliste). */
  aside: ReactNode;
  /** false bei Pflicht-Abläufen: Hintergrund und Escape schließen dann nicht. */
  dismissible?: boolean;
  children: ReactNode;
}

const subscribeNever = () => () => {};
const PANEL =
  "glass-surface glass-blur relative flex w-full flex-col overflow-hidden !bg-[rgba(246,247,251,0.97)] dark:!bg-[rgba(14,16,25,0.97)] lg:grid lg:max-w-5xl lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]";
const PANEL_PHONE = "h-[94dvh] rounded-t-[30px] pb-[env(safe-area-inset-bottom,0px)]";
const PANEL_WIDE = "h-[min(88dvh,780px)] max-w-xl rounded-[30px]";

/**
 * Rahmen des Online-Ident-Ablaufs: auf dem Handy ein hohes Sheet von unten, ab Tablet ein Panel in der Mitte,
 * ab iPad quer zweispaltig mit Schrittliste links. Liegt im Portal über Topbar und Navigation.
 */
export default function IdentDialog({ open, onClose, label, aside, dismissible = true, children }: IdentDialogProps) {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const wide = useWideScreen();
  const hidden = wide ? { opacity: 0, y: 28, scale: 0.97 } : { y: "100%" };
  useSheetFeedback(open);

  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[105] flex justify-center", wide ? "items-center p-6" : "items-end")}>
          <motion.div
            key="ident-backdrop"
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            key="ident-panel"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={cn(PANEL, wide ? PANEL_WIDE : PANEL_PHONE)}
            initial={hidden}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={hidden}
            transition={SOFT_SPRING}
          >
            <aside className="hidden min-h-0 p-3 lg:flex">{aside}</aside>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
