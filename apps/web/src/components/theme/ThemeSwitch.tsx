import { motion } from "motion/react";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { cn } from "../../lib/cn";
import SolarIcon from "./SolarIcon";

const BASE =
  "no-touch-target-fix flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border p-0 shadow-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2";

/** Hell/Dunkel-Schalter der Topbar, Aussehen aus v1. */
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
      className={cn(
        BASE,
        isDark
          ? "border-slate-700 bg-slate-800 hover:bg-slate-700 focus-visible:ring-slate-500/40"
          : "border-slate-200 bg-white hover:bg-slate-50 focus-visible:ring-slate-300/40",
      )}
    >
      <SolarIcon isDark={isDark} />
    </motion.button>
  );
}
