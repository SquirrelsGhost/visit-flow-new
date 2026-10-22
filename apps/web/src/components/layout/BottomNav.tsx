import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { HOME_HREF, NAV_HEIGHT, NAV_LEFT, NAV_RIGHT, isActivePath } from "../../lib/navigation/navItems";
import { shellTexts } from "../../texts/appTexts";
import BottomNavHome from "./BottomNavHome";
import BottomNavItem from "./BottomNavItem";
import OfflineBadge from "./OfflineBadge";

const NAV =
  "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/65";

/** Untere Navigation aus v1: Battle, Übersicht, Home (erhöht), Rechner, Assistent. Gleitet beim Start von unten herein. */
export default function BottomNav() {
  const pathname = usePathname();
  return (
    <motion.nav
      className={NAV}
      aria-label={shellTexts.mainNav}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ ...SOFT_SPRING, delay: 0.1 }}
    >
      <ul className="flex w-full items-end justify-between px-3" style={{ height: NAV_HEIGHT }}>
        <OfflineBadge />
        {NAV_LEFT.map((item) => (
          <li key={item.href} className="h-full flex-1 text-center">
            <BottomNavItem item={item} active={isActivePath(pathname, item.href)} />
          </li>
        ))}
        <li className="h-full flex-1 text-center">
          <BottomNavHome active={isActivePath(pathname, HOME_HREF)} />
        </li>
        {NAV_RIGHT.map((item) => (
          <li key={item.href} className="h-full flex-1 text-center">
            <BottomNavItem item={item} active={isActivePath(pathname, item.href)} />
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
