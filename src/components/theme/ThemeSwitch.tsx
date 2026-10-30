import { motion } from "motion/react";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { GLASS_ICON_BUTTON } from "../glass/glassStyles";
import SolarIcon from "./SolarIcon";

const BASE = `${GLASS_ICON_BUTTON} p-0`;

/** Hell/Dunkel-Schalter der Topbar, Aussehen aus v1. */
export interface ThemeSwitchProps { readonly _?: never; }

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t("nav.themeDark") : t("nav.themeLight")}
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className={BASE}
    >
      <SolarIcon isDark={isDark} />
    </motion.button>
  );
}
