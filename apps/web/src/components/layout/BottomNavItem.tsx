import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { hapticFeedback } from "../../lib/device/haptics";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import type { NavItem } from "../../lib/navigation/navItems";
import { cn } from "../../lib/cn";

interface BottomNavItemProps {
  item: NavItem;
  active: boolean;
}

const ITEM =
  "relative flex h-full flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium whitespace-nowrap select-none transition-colors duration-300";

/** Ein Eintrag der unteren Navigation (v1-Optik). Aktiv: Symbol hebt sich, ein Punkt gleitet unter den Eintrag. */
export default function BottomNavItem({ item, active }: BottomNavItemProps) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={() => hapticFeedback("light")}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM, active ? "text-primary" : "text-muted-foreground hover:text-foreground")}
    >
      <motion.span whileTap={{ scale: 0.86 }} animate={{ y: active ? -2 : 0 }} transition={SNAPPY_SPRING}>
        <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      </motion.span>
      <span>{t(item.labelKey)}</span>
      {active && (
        <motion.span
          layoutId="bottom-nav-indicator"
          transition={SNAPPY_SPRING}
          className="absolute bottom-0.5 h-1 w-5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
        />
      )}
    </Link>
  );
}
