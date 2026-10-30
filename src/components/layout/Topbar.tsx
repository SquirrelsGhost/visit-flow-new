import { motion } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { canSwitchVertical } from "../../lib/navigation/verticals";
import { GLASS_BAR } from "../glass/glassStyles";
import ThemeSwitch from "../theme/ThemeSwitch";
import OnlineDot from "./OnlineDot";
import TopbarTitle from "./TopbarTitle";
import UserMenu from "./UserMenu";
import VerticalSwitch from "./VerticalSwitch";

const HEADER = `${GLASS_BAR} fixed inset-x-0 top-0 z-50 flex h-20 w-full items-center justify-between px-4 pt-[env(safe-area-inset-top)] text-foreground md:h-24 md:px-6`;

/** Topbar aus v1 (MainHeader): Name der aktuellen Seite links, rechts Online-Status, Sparten-Umschalter, Hell/Dunkel und Benutzermenü. Gleitet beim Start herein. */
export interface TopbarProps { readonly _?: never; }

export default function Topbar() {
  const { user } = useAuth();
  const controls = [
    <OnlineDot key="online" />,
    ...(user && canSwitchVertical(user) ? [<VerticalSwitch key="vertical" />] : []),
    <ThemeSwitch key="theme" />,
    <UserMenu key="user" />,
  ];
  return (
    <motion.header className={HEADER} initial={{ y: "-100%" }} animate={{ y: 0 }} transition={SOFT_SPRING}>
      <TopbarTitle />
      <motion.div
        className="relative flex items-center gap-2.5"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
      >
        {controls.map((child) => (
          <motion.div
            key={child.key}
            variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: SOFT_SPRING } }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </motion.header>
  );
}
