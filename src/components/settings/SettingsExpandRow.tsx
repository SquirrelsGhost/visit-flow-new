import { ChevronDown, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { SOFT_SPRING } from "../../lib/motion/presets";
import type { SettingsTone } from "../../lib/settings/settingsTones";
import SettingsRowText from "./SettingsRowText";
import SettingsRowTile from "./SettingsRowTile";
import { ROW, ROW_INTERACTIVE, ROW_VALUE } from "./settingsStyles";

interface SettingsExpandRowProps {
  icon: LucideIcon;
  tone: SettingsTone;
  title: string;
  subtitle?: string;
  value?: string;
  /** Von außen gesteuert, z. B. um nach dem Speichern zuzuklappen. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

const OPEN = { duration: 0.42, ease: [0.22, 1, 0.36, 1] } as const;

/** Zeile, die ein kleines Formular weich unter sich aufklappt (Hausadresse, Kilometerstand). */
export default function SettingsExpandRow({ icon, tone, title, subtitle, value, open: controlled, onOpenChange, children }: SettingsExpandRowProps) {
  const [inner, setInner] = useState(false);
  const open = controlled ?? inner;
  const setOpen = (next: boolean) => {
    setInner(next);
    onOpenChange?.(next);
  };
  const panelId = useId();
  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)} className={cn(ROW, ROW_INTERACTIVE)}>
        <SettingsRowTile icon={icon} tone={tone} />
        <SettingsRowText title={title} subtitle={subtitle} />
        {value && <span className={ROW_VALUE}>{value}</span>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SOFT_SPRING} className="shrink-0 text-slate-400 dark:text-white/30">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} key="panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={OPEN} className="overflow-hidden">
            <div className="space-y-3 px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
