import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "../../hooks/useTranslation";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { HOME_HREF } from "../../lib/navigation/navItems";
import ThemeSwitch from "../theme/ThemeSwitch";
import OnlineDot from "./OnlineDot";
import UserMenu from "./UserMenu";

const HEADER =
  "fixed inset-x-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-slate-50/90 to-slate-100/90 px-4 pt-[env(safe-area-inset-top)] text-foreground shadow-md backdrop-blur-xl md:h-24 md:px-6 dark:border-slate-700/80 dark:from-slate-900/90 dark:to-slate-800/90";

/** Topbar aus v1 (MainHeader): Titel links, rechts Online-Status, Hell/Dunkel und Benutzermenü. Gleitet beim Start herein. */
export default function Topbar() {
  const { t } = useTranslation();
  return (
    <motion.header className={HEADER} initial={{ y: "-100%" }} animate={{ y: 0 }} transition={SOFT_SPRING}>
      <Link href={HOME_HREF} className="min-w-0 flex-1 select-none">
        <motion.h1
          className="inline-block bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold text-transparent md:text-2xl dark:from-white dark:to-slate-200"
          initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ ...SOFT_SPRING, delay: 0.15 }}
        >
          {t("app.title")}
        </motion.h1>
      </Link>
      <motion.div
        className="relative flex items-center gap-2.5"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
      >
        {[<OnlineDot key="online" />, <ThemeSwitch key="theme" />, <UserMenu key="user" />].map((child) => (
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
