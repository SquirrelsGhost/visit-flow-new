// Animiert mit motion (nur im Browser)
"use client";

import { Hammer } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { riseIn, staggerParent } from "../../lib/motion/presets";
import { HOME_HREF } from "../../lib/navigation/navItems";
import { shellTexts } from "../../texts/appTexts";

/** Platzhalter für Bereiche, die noch übernommen werden. */
export default function PendingArea() {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
      variants={staggerParent(0.08, 0.15)}
      initial="hidden"
      animate="show"
    >
      <motion.span variants={riseIn} className="rounded-2xl bg-red-50 p-4 text-red-600 shadow-sm dark:bg-red-950/40 dark:text-red-400">
        <Hammer className="h-8 w-8" />
      </motion.span>
      <motion.h2 variants={riseIn} className="text-xl font-bold text-foreground">
        {shellTexts.pendingTitle}
      </motion.h2>
      <motion.p variants={riseIn} className="max-w-xs text-sm text-muted-foreground">
        {shellTexts.pendingBody}
      </motion.p>
      <motion.div variants={riseIn}>
        <Link href={HOME_HREF} className="mt-2 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-red-600/20 transition-transform active:scale-95">
          {shellTexts.backToMap}
        </Link>
      </motion.div>
    </motion.div>
  );
}
