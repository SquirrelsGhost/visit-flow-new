import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import type { MapFailure } from "../../hooks/useMapbox";
import { riseIn, staggerParent } from "../../lib/motion/presets";
import { mapTexts } from "../../texts/appTexts";

interface MapNoticeProps {
  failure: MapFailure;
}

const MESSAGES: Record<MapFailure, string> = {
  token: mapTexts.noToken,
  webgl: mapTexts.failedWebgl,
  init: mapTexts.failedInit,
};

/** Sichtbarer Fehlerzustand statt leerer Karte (v1). */
export default function MapNotice({ failure }: MapNoticeProps) {
  return (
    <motion.div
      role="alert"
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/95 p-6 text-center backdrop-blur-sm"
      variants={staggerParent(0.08, 0.1)}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-xs">
        <motion.div variants={riseIn}>
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-orange-500" />
        </motion.div>
        <motion.p variants={riseIn} className="mb-1 text-base font-semibold">
          {mapTexts.failedTitle}
        </motion.p>
        <motion.p variants={riseIn} className="mb-4 text-sm text-muted-foreground">
          {MESSAGES[failure]}
        </motion.p>
        <motion.button
          variants={riseIn}
          type="button"
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
        >
          {mapTexts.reload}
        </motion.button>
      </div>
    </motion.div>
  );
}
