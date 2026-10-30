// Dreht das Symbol beim Tippen einmal
"use client";

import { RotateCcw } from "lucide-react";
import { motion, useAnimationControls } from "motion/react";
import { battleTexts } from "../../../texts/battleTexts";

interface HeroRefreshButtonProps {
  onRefresh: () => void;
}

/** Runder Glasknopf neben dem Umschalter: lädt Battles und Sales neu. */
export default function HeroRefreshButton({ onRefresh }: HeroRefreshButtonProps) {
  const controls = useAnimationControls();
  return (
    <button
      type="button"
      aria-label={battleTexts.refresh}
      title={battleTexts.refresh}
      onClick={() => {
        void controls.start({ rotate: [0, -360], transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } });
        onRefresh();
      }}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/70 ring-1 ring-inset ring-white/10 transition-[background-color,color,transform] duration-200 hover:bg-white/15 hover:text-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <motion.span animate={controls} className="flex">
        <RotateCcw className="h-4 w-4" />
      </motion.span>
    </button>
  );
}
