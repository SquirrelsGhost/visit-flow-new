import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavLongPress } from "../../hooks/useNavLongPress";
import { feedback } from "../../lib/feedback/feedback";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import type { NavItem } from "../../lib/navigation/navItems";
import { cn } from "../../lib/cn";

interface BottomNavItemProps {
  item: NavItem;
  active: boolean;
  /** Langes Drücken öffnet die Auswahl für diesen Platz. */
  onLongPress: () => void;
}

const ITEM =
  "relative flex h-full flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium whitespace-nowrap select-none touch-manipulation [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] transition-colors duration-300";

/** Ein Eintrag der unteren Navigation (v1-Optik). Aktiv: Symbol hebt sich, ein Punkt gleitet darunter. Gehalten: sinkt leicht ein. */
export default function BottomNavItem({ item, active, onLongPress }: BottomNavItemProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const { pressing, handlers } = useNavLongPress(onLongPress);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      draggable={false}
      onClick={() => !active && feedback("select")}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM, active ? "text-red-500 dark:text-red-400" : "text-slate-500 hover:text-foreground dark:text-white/45")}
      {...handlers}
    >
      <motion.span
        whileTap={{ scale: 0.86 }}
        animate={{ y: active ? -2 : 0, scale: pressing && !reduce ? 0.8 : 1 }}
        transition={pressing ? { duration: 0.42, ease: "easeOut" } : SNAPPY_SPRING}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      </motion.span>
      <span className="max-w-full truncate px-0.5">{t(item.labelKey)}</span>
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
