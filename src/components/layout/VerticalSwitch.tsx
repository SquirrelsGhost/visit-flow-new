import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { setVertical, useVertical } from "../../hooks/useVertical";
import { cn } from "../../lib/cn";
import { allowedVerticals, VERTICAL_OPTIONS } from "../../lib/navigation/verticals";
import { shellTexts } from "../../texts/appTexts";
import VerticalSwitchPanel from "./VerticalSwitchPanel";

const PILL =
  "glass-surface no-touch-target-fix flex h-9 flex-shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:bg-[var(--glass-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 dark:text-white/80";

/** Sparten-Umschalter der Topbar aus v1 (Telco, Energie, Lead): für Admins und Nutzer mit mehreren freigegebenen Sparten. */
export interface VerticalSwitchProps { readonly _?: never; }

export default function VerticalSwitch() {
  const { user } = useAuth();
  const vertical = useVertical();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;
  const options = allowedVerticals(user);
  if (options.length < 2) return null;
  const current = VERTICAL_OPTIONS.find((option) => option.id === vertical) ?? VERTICAL_OPTIONS[0];
  const Icon = current.icon;

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        aria-label={`${shellTexts.verticalSwitch}: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.94 }}
        className={PILL}
        data-testid="vertical-switch"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current.id}
            initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <Icon className={cn("h-4 w-4", current.iconTone)} />
          </motion.span>
        </AnimatePresence>
        <span className="hidden md:inline">{current.label}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <VerticalSwitchPanel
            key="verticals"
            options={options}
            active={current.id}
            onSelect={(next) => {
              setVertical(next);
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
