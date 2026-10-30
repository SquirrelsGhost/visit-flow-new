import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { useBottomNavSlots } from "../../hooks/useBottomNavSlots";
import { HOME_HREF, NAV_HEIGHT, isActivePath } from "../../lib/navigation/navItems";
import { shellTexts } from "../../texts/appTexts";
import BottomNavHint from "./BottomNavHint";
import BottomNavHome from "./BottomNavHome";
import BottomNavSlot from "./BottomNavSlot";
import OfflineBadge from "./OfflineBadge";
import BottomNavSheet from "./navCustomize/BottomNavSheet";

const NAV = "glass-blur fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] shadow-[inset_0_1px_0_var(--glass-divider),0_-12px_40px_-16px_rgba(15,23,42,0.25)]";

const withoutQuery = (href: string) => href.split("?")[0] ?? href;

/**
 * Untere Navigation aus v1: zwei Plätze, Home (erhöht, fest), zwei Plätze. Standard Battle, Übersicht | Rechner
 * (Lead: Aufträge), Assistent; langes Drücken auf einen Platz öffnet die Auswahl. Gleitet beim Start von unten herein.
 * Auf Tablet und Desktop bleiben die Plätze kompakt in der Mitte statt über die ganze Breite.
 */
export interface BottomNavProps { readonly _?: never; }

export default function BottomNav() {
  const pathname = usePathname();
  const { slots, options, customized, choose, reset } = useBottomNavSlots();
  const [editing, setEditing] = useState<number | null>(null);
  const slot = (i: number) => {
    const target = slots[i];
    if (!target) return null;
    return <BottomNavSlot key={i} target={target} active={isActivePath(pathname, withoutQuery(target.href))} onLongPress={() => setEditing(i)} />;
  };
  return (
    <>
      <motion.nav
        className={NAV}
        aria-label={shellTexts.mainNav}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ ...SOFT_SPRING, delay: 0.1 }}
      >
        <BottomNavHint dismissed={customized || editing !== null} />
        <ul className="mx-auto flex w-full max-w-[680px] items-end justify-between px-3" style={{ height: NAV_HEIGHT }}>
          <OfflineBadge />
          {slot(0)}
          {slot(1)}
          <li className="h-full flex-1 text-center">
            <BottomNavHome active={isActivePath(pathname, HOME_HREF)} />
          </li>
          {slot(2)}
          {slot(3)}
        </ul>
      </motion.nav>
      <BottomNavSheet
        slot={editing}
        slots={slots}
        options={options}
        customized={customized}
        onSlotChange={setEditing}
        onChoose={choose}
        onReset={reset}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
