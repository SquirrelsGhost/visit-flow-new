// Animiert mit motion (nur im Browser)
"use client";

import { Hammer } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { riseIn, staggerParent } from "../../lib/motion/presets";
import { HOME_HREF } from "../../lib/navigation/navItems";
import { shellTexts } from "../../texts/appTexts";
import { GLASS_BUTTON_INLINE } from "../glass/glassStyles";

/** Platzhalter für Bereiche, die noch übernommen werden. */
export interface PendingAreaProps { readonly _?: never; }

export default function PendingArea() {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
      variants={staggerParent(0.08, 0.15)}
      initial="hidden"
      animate="show"
    >
      <motion.span variants={riseIn} className="glass-surface rounded-full p-5 text-red-500 dark:text-red-400">
        <Hammer className="h-8 w-8" />
      </motion.span>
      <motion.h2 variants={riseIn} className="text-xl font-bold text-foreground">
        {shellTexts.pendingTitle}
      </motion.h2>
      <motion.p variants={riseIn} className="max-w-xs text-sm text-muted-foreground">
        {shellTexts.pendingBody}
      </motion.p>
      <motion.div variants={riseIn}>
        <Link href={HOME_HREF} className={`${GLASS_BUTTON_INLINE} mt-2 px-6`}>
          {shellTexts.backToMap}
        </Link>
      </motion.div>
    </motion.div>
  );
}
