// Scrollgesteuerte Reise durchs 3D-Revier: braucht den Browser
"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useWebsite } from "../../../hooks/website/useWebsite";
import type { AnchorKey } from "../../../lib/website/revier/revierEngine";
import { journeyStations } from "../../../texts/websiteJourneyTexts";
import HoloLabels from "./HoloLabels";
import JourneyFinale from "./JourneyFinale";
import JourneyHero from "./JourneyHero";
import JourneyRail from "./JourneyRail";
import JourneyStation from "./JourneyStation";
import RevierCanvas from "./RevierCanvas";

/**
 * Herzstück der Website: ein sehr hoher Abschnitt, in dem die 3D-Szene stehen bleibt (sticky),
 * während der Scrollfortschritt Kamera, Türen, Läufer und Texte steuert.
 */
export interface RevierJourneyProps { readonly _?: never; }

const SCRIM_STEPS = [0.05, 0.085, 0.84, 0.875];

export default function RevierJourney() {
  const section = useRef<HTMLElement>(null);
  const labels = useRef<Partial<Record<AnchorKey, HTMLElement | null>>>({});
  const { scroller } = useWebsite();
  const { scrollYProgress } = useScroll({ target: section, container: scroller, offset: ["start start", "end end"] });
  // Abdunklung links nur hinter den Stationstexten, nicht über dem Logo am Anfang und im Finale
  const scrim = useTransform(scrollYProgress, SCRIM_STEPS, [0, 1, 1, 0]);

  return (
    <section ref={section} id="funktionen" aria-label="Visit Flow" className="relative h-[1300svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <RevierCanvas progress={scrollYProgress} labels={labels} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,#05060b_100%)]" aria-hidden />
        <motion.div style={{ opacity: scrim }} className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-[#05060b]/90 via-[#05060b]/55 to-transparent lg:block" aria-hidden />
        <HoloLabels labels={labels} />
        <JourneyHero progress={scrollYProgress} />
        {journeyStations.map((station) => (
          <JourneyStation key={station.key} station={station} progress={scrollYProgress} />
        ))}
        <JourneyFinale progress={scrollYProgress} />
        <JourneyRail progress={scrollYProgress} />
      </div>
    </section>
  );
}
