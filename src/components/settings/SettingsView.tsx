// Reiterwahl mit useState und sessionStorage, Wischgesten (nur im Browser)
"use client";

import { AnimatePresence, motion, type PanInfo, type Variants } from "motion/react";
import { useRef, useState, type ComponentType } from "react";
import { useSettingsTab } from "../../hooks/useSettingsTab";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { neighborTab, SETTINGS_TABS, type SettingsTab } from "../../lib/settings/settingsTabs";
import GlassPage from "../glass/GlassPage";
import AppSettings from "./AppSettings";
import PersonalSettings from "./PersonalSettings";
import SecuritySettings from "./SecuritySettings";
import SettingsTabs from "./SettingsTabs";
import StorageSettings from "./StorageSettings";

const PANELS: Record<SettingsTab, ComponentType> = {
  personal: PersonalSettings,
  app: AppSettings,
  security: SecuritySettings,
  storage: StorageSettings,
};

/** Ab so viel Pixel waagerecht wechselt ein Wisch den Reiter (v1: 50). */
const SWIPE_PX = 60;

/** Der neue Reiter kommt aus der Richtung, in die man geht; der alte weicht zur anderen Seite aus. */
const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 36, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: SOFT_SPRING },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24, filter: "blur(4px)", transition: { duration: 0.16 } }),
};

const isFormField = (target: EventTarget | null) => target instanceof Element && target.closest("input, select, textarea") !== null;

/** Einstellungen (/settings, v1 SettingsPage) mit den Reitern Persönlich, App, Sicherheit und Speicher. */
export interface SettingsViewProps { readonly _?: never; }

export default function SettingsView() {
  const [tab, setTab] = useSettingsTab();
  const [direction, setDirection] = useState(1);
  const scroller = useRef<HTMLDivElement>(null);
  const Panel = PANELS[tab];

  const go = (next: SettingsTab) => {
    setDirection(SETTINGS_TABS.indexOf(next) >= SETTINGS_TABS.indexOf(tab) ? 1 : -1);
    setTab(next);
    // Jeder Reiter beginnt oben, auch wenn der vorige weit gescrollt war
    scroller.current?.scrollTo?.({ top: 0 });
  };

  const onPanEnd = (event: PointerEvent, { offset }: PanInfo) => {
    if (isFormField(event.target) || Math.abs(offset.x) < SWIPE_PX || Math.abs(offset.x) < Math.abs(offset.y) * 1.5) return;
    const next = neighborTab(tab, offset.x < 0 ? 1 : -1);
    if (next) go(next);
  };

  return (
    <GlassPage>
      <div className="flex h-full flex-col">
        <SettingsTabs active={tab} onChange={go} />
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={tab}
              id="settings-panel"
              role="tabpanel"
              aria-labelledby={`settings-tab-${tab}`}
              className="min-h-full touch-pan-y"
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              onPanEnd={onPanEnd}
            >
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GlassPage>
  );
}
