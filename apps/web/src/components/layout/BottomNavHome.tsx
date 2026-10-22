import { Home } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { hapticFeedback } from "../../lib/device/haptics";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { HOME_HREF } from "../../lib/navigation/navItems";

interface BottomNavHomeProps {
  active: boolean;
}

/** Erhöhter roter Home-Knopf in der Mitte (Laufliste/Karte), wie in v1. Aktiv mit sanft atmendem Leuchten. */
export default function BottomNavHome({ active }: BottomNavHomeProps) {
  const { t } = useTranslation();
  return (
    <Link
      href={HOME_HREF}
      onClick={() => hapticFeedback("medium")}
      aria-current={active ? "page" : undefined}
      className="relative flex h-full flex-col items-center justify-center py-1.5"
    >
      <motion.span
        className="relative -mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-primary-foreground shadow-lg shadow-red-600/30 ring-4 ring-background"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.9 }}
        transition={SNAPPY_SPRING}
      >
        {active && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-red-500/50 blur-md"
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.18, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <Home className="relative h-6 w-6" />
      </motion.span>
      <span className="sr-only">{t("nav.home")}</span>
    </Link>
  );
}
