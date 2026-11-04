// Blendet mit dem Scrollfortschritt ein und aus: braucht den Browser
"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { JourneyStation as Station } from "../../../texts/websiteJourneyTexts";
import AccentText from "../ui/AccentText";
import DoorLegend from "./DoorLegend";

/**
 * Eine Station der Reise: Nummer, Bereich, großer Titel, ein Satz, Schlagworte. Kein Kasten, nur Typografie über der Szene.
 * Desktop links, Handy unten über einem dunklen Verlauf.
 */
interface JourneyStationProps {
  station: Station;
  progress: MotionValue<number>;
}

const FADE = 0.02;

export default function JourneyStation({ station, progress }: JourneyStationProps) {
  const { from, to } = station;
  const opacity = useTransform(progress, [from - FADE, from, to - FADE, to], [0, 1, 1, 0]);
  const y = useTransform(progress, [from - FADE, from, to - FADE, to], [40, 0, 0, -40]);
  const blur = useTransform(progress, [from - FADE, from, to - FADE, to], ["blur(12px)", "blur(0px)", "blur(0px)", "blur(12px)"]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.article
      style={{ opacity, y, filter: blur, visibility }}
      className="absolute inset-x-0 bottom-0 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 sm:px-10 lg:bottom-auto lg:left-[max(2.5rem,calc((100vw-72rem)/2))] lg:right-auto lg:top-1/2 lg:max-w-[34rem] lg:-translate-y-1/2 lg:p-0"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#05060b] via-[#05060b]/85 to-transparent lg:hidden" />
      <p className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-white/55">
        {station.index && <span className="font-[family-name:var(--vfw-display)] text-[#ff6b6b]">{station.index}</span>}
        <span className="h-px w-8 bg-white/25" />
        {station.kicker}
      </p>
      <h2 className="mt-5 text-balance font-[family-name:var(--vfw-display)] text-[clamp(2.4rem,5.4vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white">
        <AccentText text={station.title} />
      </h2>
      <p className="mt-5 max-w-md text-pretty text-[17px] leading-relaxed text-white/70">{station.text}</p>
      {station.key === "doors" && <DoorLegend />}
      {station.chips && (
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-white/50">
          {station.chips.map((chip) => (
            <span key={chip} className="flex items-center gap-2">
              <span className="size-1 rounded-full bg-[#ff6b6b]" />
              {chip}
            </span>
          ))}
        </p>
      )}
    </motion.article>
  );
}
