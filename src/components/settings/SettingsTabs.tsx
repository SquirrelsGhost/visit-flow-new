import { HardDrive, ShieldCheck, Smartphone, UserRound, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "../../lib/cn";
import { feedback } from "../../lib/feedback/feedback";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { SETTINGS_TAB_LABELS, SETTINGS_TABS, type SettingsTab } from "../../lib/settings/settingsTabs";

interface SettingsTabsProps {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const ICONS: Record<SettingsTab, LucideIcon> = { personal: UserRound, app: Smartphone, security: ShieldCheck, storage: HardDrive };

const BAR = "relative z-10 shrink-0 px-4 pb-1 pt-3";
/** Gläserne Leiste; sie liegt über dem ruhigen Hintergrund und braucht deshalb keine teure Unschärfe. */
const TRACK = "glass-surface mx-auto flex max-w-xl gap-1 rounded-[22px] p-1.5";
const TAB =
  "relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-semibold tracking-wide transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40";

/** Reiter als gläserne Segment-Steuerung: Symbol über dem Namen, die leuchtende rote Fläche gleitet zum gewählten Reiter. */
export default function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  const { t } = useTranslation();
  return (
    <div className={BAR}>
      <div role="tablist" aria-label={t("settings.title")} className={TRACK}>
        {SETTINGS_TABS.map((tab) => {
          const selected = tab === active;
          const Icon = ICONS[tab];
          return (
            <motion.button
              key={tab}
              type="button"
              role="tab"
              id={`settings-tab-${tab}`}
              aria-selected={selected}
              aria-controls="settings-panel"
              onClick={() => {
                if (tab !== active) feedback("select");
                onChange(tab);
              }}
              whileTap={{ scale: 0.95 }}
              className={cn(TAB, selected ? "text-white" : "text-slate-500 hover:text-foreground dark:text-white/50 dark:hover:text-white")}
            >
              {selected && <motion.span layoutId="settings-tab-pill" transition={SNAPPY_SPRING} className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(220,38,38,0.75)]" />}
              <Icon aria-hidden className="relative h-4 w-4" />
              <span className="relative">{t(SETTINGS_TAB_LABELS[tab])}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
