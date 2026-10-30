// Zeigt den Tipp einmal pro Gerät; braucht Timer und localStorage
"use client";

import { Hand, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { readPreference, writePreference } from "../../lib/preferences";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { bottomNavTexts as texts } from "../../texts/bottomNavTexts";

interface BottomNavHintProps {
  /** Sobald der Nutzer die Leiste einmal angepasst hat, braucht es keinen Tipp mehr. */
  dismissed: boolean;
}

const SEEN_KEY = "vf_nav_hint_seen";
const SHOW_AFTER_MS = 2200;
const HIDE_AFTER_MS = 7000;

/** Kleiner Glas-Hinweis über der Leiste beim ersten Mal: "Lange drücken zum Anpassen". Kommt nur einmal. */
export default function BottomNavHint({ dismissed }: BottomNavHintProps) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readPreference(SEEN_KEY) === "1") return;
    const show = setTimeout(() => {
      writePreference(SEEN_KEY, "1");
      setVisible(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hide = setTimeout(() => setVisible(false), HIDE_AFTER_MS);
    return () => clearTimeout(hide);
  }, [visible]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(100%+14px)] flex justify-center px-4">
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            key="nav-hint"
            role="status"
            className="glass-surface glass-blur pointer-events-auto flex items-center !bg-[rgba(255,255,255,0.9)] dark:!bg-[rgba(20,22,32,0.9)] gap-2 whitespace-nowrap rounded-full py-1.5 pl-2 pr-1.5 text-[12.5px] font-medium text-foreground shadow-[0_12px_30px_-12px_rgba(15,23,42,0.45)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={SOFT_SPRING}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-600 text-white">
              <Hand aria-hidden className="h-3.5 w-3.5" />
            </span>
            {texts.hint}
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label={texts.hintClose}
              className="no-touch-target-fix flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-[var(--glass-hover)] hover:text-foreground dark:text-white/40"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
