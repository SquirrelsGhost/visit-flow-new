// Blendet mit dem Scrollfortschritt aus: braucht den Browser
"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { journeyHero as t } from "../../../texts/websiteJourneyTexts";
import AccentText from "../ui/AccentText";

/** Erster Bildschirm: Titel unter dem leuchtenden Kompass, Wörter steigen aus der Unschärfe. Verschwindet beim Abtauchen. */
interface JourneyHeroProps {
  progress: MotionValue<number>;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const LINE = "block font-[family-name:var(--vfw-display)] text-[clamp(3rem,9.5vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.055em]";

function Rise({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.span
      className="block"
      initial={{ opacity: 0, y: "0.4em", filter: "blur(16px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: EASE, delay }}
    >
      {children}
    </motion.span>
  );
}

export default function JourneyHero({ progress }: JourneyHeroProps) {
  const opacity = useTransform(progress, [0, 0.05], [1, 0]);
  const y = useTransform(progress, [0, 0.06], [0, -80]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div style={{ opacity, y, visibility }} className="absolute inset-x-0 bottom-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center sm:pb-14">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[75%] bg-gradient-to-t from-[#05060b] via-[#05060b]/80 to-transparent" />
      <Rise delay={0.4}>
        <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/60">
          <span className="vfw-blink size-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          {t.badge}
        </span>
      </Rise>
      <h1 className="mt-5 text-white">
        <Rise delay={0.6}>
          <span className={LINE}>{t.titleTop}</span>
        </Rise>
        <Rise delay={0.85}>
          <span className={LINE}>
            <AccentText text={t.titleBottom} />
          </span>
        </Rise>
      </h1>
      <Rise delay={1.2}>
        <span className="mx-auto mt-6 block max-w-xl text-pretty text-lg text-white/65 sm:text-xl">{t.lead}</span>
      </Rise>
      <Rise delay={1.6}>
        <span className="mt-8 inline-flex flex-col items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
          {t.scroll}
          <motion.span className="h-10 w-px bg-gradient-to-b from-white/60 to-transparent" animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }} transition={{ duration: 2, repeat: Infinity }} />
        </span>
      </Rise>
    </motion.div>
  );
}
