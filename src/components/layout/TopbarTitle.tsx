import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { usePathname } from "next/navigation";
import { useTranslation } from "../../hooks/useTranslation";
import { SOFT_SPRING } from "../../lib/motion/presets";
import { pageTitleKey } from "../../lib/navigation/pageTitles";

const TITLE =
  "col-start-1 row-start-1 block truncate bg-gradient-to-b from-slate-950 to-slate-600 bg-clip-text text-[22px] font-semibold tracking-[-0.03em] text-transparent md:text-[28px] dark:from-white dark:to-white/60";

/** Neuer Titel steigt von unten aus der Unschärfe, der alte weicht nach oben aus; beide liegen übereinander. */
const swap: Variants = {
  enter: { opacity: 0, y: 10, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT_SPRING },
  leave: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.18, ease: "easeIn" } },
};

/** Bei "Bewegung reduzieren" nur eine kurze Überblendung. */
const fade: Variants = {
  enter: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  leave: { opacity: 0, transition: { duration: 0.12 } },
};

/** Name der aktuellen Seite links in der Topbar; blendet beim Seitenwechsel weich über. */
export interface TopbarTitleProps { readonly _?: never; }

export default function TopbarTitle() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const title = t(pageTitleKey(pathname));
  return (
    <motion.div
      className="grid min-w-0 flex-1 select-none pr-3"
      initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ ...SOFT_SPRING, delay: 0.15 }}
    >
      <AnimatePresence initial={false}>
        <motion.h1 key={title} className={TITLE} variants={reduce ? fade : swap} initial="enter" animate="show" exit="leave">
          {title}
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  );
}
